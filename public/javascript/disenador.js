(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const stage = $('#previewStage');
  const sourceImage = $('#garmentPreview');
  const message = $('#actionMessage');
  if (!stage || !sourceImage || !message) return;

  const state = {
    prendaId: 0, modelo: '', color: 'Rosa', colorHex: '#d95d76',
    tela: 'Algodón', patron: 'Floral', cintura: 70, falda: 60,
    talla: 'M', texto: '', posicion: 'Pecho', zoom: 1,
    angulo: 'Frente', herramienta: 'Seleccionar',
    textX: 0.5, textY: 0.42, textSize: 28, textRotation: 0,
    brushColor: '#7c4dff', brushSize: 5, strokes: [], shapes: [], paintRegions: [], logo: null, logoX: .72, logoY: .72, shapeColor: '#7c4dff', shapeWidth: 4, textColor: '#20202a', textFont: 'Inter'
  };

  const canvas = document.createElement('canvas');
  canvas.id = 'designerCanvas';
  canvas.setAttribute('aria-label', 'Lienzo de personalización de la prenda');
  canvas.style.touchAction = 'none';
  stage.insertBefore(canvas, sourceImage);
  sourceImage.hidden = true;
  const ctx = canvas.getContext('2d');
  const garment = new Image();
  garment.crossOrigin = 'anonymous';
  let imageReady = false;
  let imageBounds = null;
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let referenceImage = null;
  let referenceFile = null;
  let draggingText = false;
  let history = [];
  let historyIndex = -1;
  let lastSave = 0;
  let shapeStart = null, activeShape = null, draggingLogo = false, selectedObject = null, draggingShape = false, rotatingObject = false, rotateStartAngle = 0, currentThreeModel = null, logoImage = null, logoFile = null, threeRenderer = null, threeFrame = 0, model3DUrl = null, model3DObjectUrl = null;

  const bucketMaskCache = new Map();

  const palette = {
    Rosa: '#d95d76', Lila: '#b77cc9', Beige: '#d6b9a0', Negro: '#11131b',
    Blanco: '#f4f1ed', Rojo: '#c92848', Verde: '#287d68', Azul: '#315eaa'
  };

  function notify(text, error = false) {
    message.textContent = text;
    message.style.color = error ? '#ff9caa' : '#66e3b3';
  }

  function selectOne(selector, selected, className = 'active') {
    $$(selector).forEach(element => element.classList.toggle(className, element === selected));
  }

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    render();
  }

  function drawPattern(bounds) {
    if (state.patron === 'Ninguno') return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.clip();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = 0.20;
    ctx.strokeStyle = state.colorHex === '#f4f1ed' ? '#4d4550' : '#ffffff';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1.2;
    const gap = Math.max(13, 25 * state.zoom);
    if (state.patron === 'Lunares' || state.patron === 'Puntos') {
      for (let x = bounds.x; x < bounds.x + bounds.w; x += gap) {
        for (let y = bounds.y; y < bounds.y + bounds.h; y += gap) {
          ctx.beginPath(); ctx.arc(x + 4, y + 4, state.patron === 'Lunares' ? 2.5 : 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (state.patron === 'Cuadros') {
      for (let x = bounds.x; x < bounds.x + bounds.w; x += gap) { ctx.beginPath(); ctx.moveTo(x, bounds.y); ctx.lineTo(x, bounds.y + bounds.h); ctx.stroke(); }
      for (let y = bounds.y; y < bounds.y + bounds.h; y += gap) { ctx.beginPath(); ctx.moveTo(bounds.x, y); ctx.lineTo(bounds.x + bounds.w, y); ctx.stroke(); }
    } else if (state.patron === 'Floral' || state.patron === 'Animal print') {
      for (let x = bounds.x + 8; x < bounds.x + bounds.w; x += gap * 1.5) {
        for (let y = bounds.y + 8; y < bounds.y + bounds.h; y += gap * 1.5) {
          ctx.beginPath();
          if (state.patron === 'Floral') {
            for (let a = 0; a < 5; a++) { const angle = a * Math.PI * 2 / 5; ctx.ellipse(x + Math.cos(angle) * 3, y + Math.sin(angle) * 3, 2.5, 4, angle, 0, Math.PI * 2); }
          } else { ctx.ellipse(x, y, 5, 3, Math.PI / 4, 0, Math.PI * 2); }
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  function render() {
    if (!ctx) return;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!imageReady) {
      ctx.fillStyle = '#17243a'; ctx.font = '14px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Selecciona una prenda del catálogo', width / 2, height / 2);
      return;
    }

    const scale = Math.min((width * 0.69) / garment.naturalWidth, (height * 0.91) / garment.naturalHeight) * state.zoom;
    const w = garment.naturalWidth * scale;
    const h = garment.naturalHeight * scale;
    const x = (width - w) / 2;
    const y = (height - h) / 2;
    imageBounds = { x, y, w, h };

    const off = document.createElement('canvas');
    off.width = garment.naturalWidth; off.height = garment.naturalHeight;
    const offCtx = off.getContext('2d');
    offCtx.drawImage(garment, 0, 0);
    offCtx.globalCompositeOperation = 'source-atop';
    offCtx.globalAlpha = 0.76;
    offCtx.fillStyle = state.colorHex;
    offCtx.fillRect(0, 0, off.width, off.height);
    offCtx.globalAlpha = 1;
    offCtx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, x, y, w, h);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = state.tela === 'Encaje' ? 0.20 : state.tela === 'Seda' ? 0.07 : state.tela === 'Lino' ? 0.12 : 0.04;
    ctx.fillStyle = state.tela === 'Encaje' ? '#ffffff' : '#6f6570';
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    // Regiones pintadas con el balde: cada máscara conserva la forma exacta de la zona seleccionada.
    (state.paintRegions || []).forEach(region => {
      if (!region.mask) return;
      let mask = bucketMaskCache.get(region.mask);
      if (!mask) { mask = new Image(); bucketMaskCache.set(region.mask, mask); mask.onload = render; mask.src = region.mask; }
      if (mask.complete && mask.naturalWidth) {
        const tint = document.createElement('canvas'); tint.width = garment.naturalWidth; tint.height = garment.naturalHeight;
        const tctx = tint.getContext('2d'); tctx.fillStyle = region.color; tctx.fillRect(0,0,tint.width,tint.height); tctx.globalCompositeOperation = 'destination-in'; tctx.drawImage(mask,0,0,tint.width,tint.height);
        ctx.drawImage(tint,x,y,w,h);
      }
    });

    drawPattern(imageBounds);

    // Trazos manuales del pincel y borrador (coordenadas normalizadas).
    if (state.strokes && state.strokes.length) {
      const overlay = document.createElement('canvas');
      overlay.width = canvas.width; overlay.height = canvas.height;
      const octx = overlay.getContext('2d');
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const stroke of state.strokes) {
        if (!stroke.points || !stroke.points.length) continue;
        octx.save();
        octx.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
        octx.strokeStyle = stroke.color || state.brushColor;
        octx.lineWidth = stroke.size || state.brushSize;
        octx.lineCap = 'round'; octx.lineJoin = 'round';
        octx.beginPath();
        octx.moveTo(stroke.points[0].x * width, stroke.points[0].y * height);
        for (let i = 1; i < stroke.points.length; i++) {
          octx.lineTo(stroke.points[i].x * width, stroke.points[i].y * height);
        }
        if (stroke.points.length === 1) {
          const pt = stroke.points[0]; octx.lineTo(pt.x * width + 0.01, pt.y * height + 0.01);
        }
        octx.stroke(); octx.restore();
      }
      ctx.drawImage(overlay, 0, 0, width, height);
    }

    if (referenceImage) {
      const rw = Math.min(width * 0.28, referenceImage.naturalWidth);
      const rh = rw * referenceImage.naturalHeight / referenceImage.naturalWidth;
      ctx.save(); ctx.globalAlpha = 0.55; ctx.drawImage(referenceImage, width - rw - 18, height - rh - 18, rw, rh); ctx.restore();
    }

    // Objetos vectoriales editables (rectángulos, cuadrados y círculos).
    (state.shapes || []).forEach(shape => {
      ctx.save(); ctx.translate(shape.x+shape.w/2,shape.y+shape.h/2); ctx.rotate((shape.rotation||0)*Math.PI/180); ctx.translate(-(shape.x+shape.w/2),-(shape.y+shape.h/2)); ctx.strokeStyle = shape.color || state.shapeColor; ctx.lineWidth = shape.width || 3;
      ctx.fillStyle = shape.fillColor || shape.color || state.shapeColor; ctx.globalAlpha = shape.filled === false ? .92 : .28;
      if (shape.type === 'circle') { ctx.beginPath(); ctx.ellipse(shape.x + shape.w/2, shape.y + shape.h/2, Math.abs(shape.w/2), Math.abs(shape.h/2), 0, 0, Math.PI*2); if(shape.filled !== false)ctx.fill(); ctx.globalAlpha=1; ctx.stroke(); }
      else { if(shape.filled !== false)ctx.fillRect(shape.x,shape.y,shape.w,shape.h); ctx.globalAlpha=1; ctx.strokeRect(shape.x, shape.y, shape.w, shape.h); }
      ctx.restore();
    });
    if (selectedObject?.type === 'shape') {
      const sh=state.shapes[selectedObject.index]; if(sh){ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle='#7045ed';ctx.lineWidth=1.5;ctx.strokeRect(sh.x-6,sh.y-6,sh.w+12,sh.h+12);ctx.restore();}
    }
    if (logoImage) {
      const lw = Math.min(width * .24, logoImage.naturalWidth), lh = lw * logoImage.naturalHeight / logoImage.naturalWidth;
      const lx = width * state.logoX - lw/2, ly = height * state.logoY - lh/2;
      ctx.save(); ctx.translate(lx+lw/2,ly+lh/2); ctx.rotate((state.logoRotation||0)*Math.PI/180); ctx.globalAlpha = .95; ctx.drawImage(logoImage,-lw/2,-lh/2,lw,lh); ctx.restore();
    }

    if (state.texto) {
      const tx = width * state.textX;
      const ty = height * state.textY;
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(state.textRotation * Math.PI / 180);
      ctx.font = `700 ${state.textSize}px ${state.textFont || 'Inter'}, Arial, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.strokeText(state.texto, 0, 0);
      ctx.fillStyle = state.textColor || '#20202a'; ctx.fillText(state.texto, 0, 0);
      if (state.herramienta === 'Seleccionar' || state.herramienta === 'Mover') {
        const tw = ctx.measureText(state.texto).width + 16;
        ctx.setLineDash([4, 3]); ctx.strokeStyle = '#7145ed'; ctx.lineWidth = 1;
        ctx.strokeRect(-tw / 2, -state.textSize / 1.1, tw, state.textSize * 1.5);
      }
      ctx.restore();
    }
  }

  function loadGarment(url) {
    if (!url) return;
    imageReady = false;
    state.paintRegions = []; bucketMaskCache.clear();
    const candidate = new Image();
    candidate.onload = () => { imageReady = false; garment.src = candidate.src; render(); };
    candidate.onerror = () => notify('No se pudo cargar la imagen de esta prenda.', true);
    candidate.src = url;
  }
  garment.onload = () => { imageReady = true; resizeCanvas(); saveHistory(); };
  garment.onerror = () => notify('Error al cargar la imagen de la prenda.', true);

  function currentModel(button) {
    if (!button) return;
    state.prendaId = Number(button.dataset.prendaId || 0);
    state.modelo = button.dataset.model || button.textContent.trim();
    selectOne('.model-card', button, 'chosen');
    $('#previewNote').textContent = `Lienzo · ${state.modelo}`;
    loadGarment(button.dataset.img);
    notify(`Modelo seleccionado: ${state.modelo}`);
  }

  $$('.category-tab').forEach(button => button.addEventListener('click', () => {
    selectOne('.category-tab', button, 'selected');
    $$('.model-group').forEach(group => { group.hidden = group.dataset.group !== button.dataset.category; });
    const first = $('.model-group:not([hidden]) .model-card');
    if (first) currentModel(first);
    else notify('Esta categoría todavía no tiene prendas activas.');
  }));
  $$('.model-card').forEach(button => button.addEventListener('click', () => currentModel(button)));

  $$('.swatch').forEach(button => button.addEventListener('click', () => {
    selectOne('.swatch', button);
    state.color = button.getAttribute('aria-label') || 'Personalizado';
    state.colorHex = palette[state.color] || getComputedStyle(button).backgroundColor;
    if(currentThreeModel) currentThreeModel.traverse(node=>{if(node.isMesh){const mats=Array.isArray(node.material)?node.material:[node.material];mats.forEach(mat=>{if(mat.color)mat.color.set(state.colorHex);});}});
    render(); notify(`Color seleccionado: ${state.color}`); saveHistory();
  }));
  $('.swatch-add')?.addEventListener('click', () => {
    const picker = document.createElement('input'); picker.type = 'color'; picker.value = state.colorHex;
    picker.addEventListener('input', () => { state.color = 'Personalizado'; state.colorHex = picker.value; if(currentThreeModel) currentThreeModel.traverse(node=>{if(node.isMesh){const mats=Array.isArray(node.material)?node.material:[node.material];mats.forEach(mat=>{if(mat.color)mat.color.set(state.colorHex);});}}); selectOne('.swatch', null); render(); });
    picker.addEventListener('change', saveHistory); picker.click();
  });

  $$('.fabric-row button').forEach(button => button.addEventListener('click', () => {
    selectOne('.fabric-row button', button); state.tela = button.textContent.trim(); render(); notify(`Tela seleccionada: ${state.tela}`); saveHistory();
  }));
  $$('.pattern').forEach(button => button.addEventListener('click', () => {
    selectOne('.pattern', button); state.patron = button.getAttribute('aria-label') || 'Floral'; render(); notify(`Patrón aplicado: ${state.patron}`); saveHistory();
  }));
  $('.pattern-add')?.addEventListener('click', () => {
    state.patron = 'Ninguno'; selectOne('.pattern', null); render(); notify('Se quitó el patrón.'); saveHistory();
  });



  function setZoom(value) { state.zoom=Math.max(.5,Math.min(2.2,value)); const label=$('#zoomLabel'); if(label)label.textContent=`${Math.round(state.zoom*100)}%`; render(); }

  // Herramientas del lienzo: dibujo, selección, movimiento, rotación y eliminación.
  let activeStroke = null, dragOffset = {x:0,y:0};

  function canvasPoint(event) {
    const r = canvas.getBoundingClientRect();
    return {x:event.clientX-r.left, y:event.clientY-r.top};
  }
  function findShape(point) {
    for (let i=state.shapes.length-1;i>=0;i--) {
      const sh=state.shapes[i];
      if(sh.type==='circle'){const rx=Math.max(8,Math.abs(sh.w/2)+12),ry=Math.max(8,Math.abs(sh.h/2)+12),dx=point.x-(sh.x+sh.w/2),dy=point.y-(sh.y+sh.h/2);if((dx*dx)/(rx*rx)+(dy*dy)/(ry*ry)<=1)return i;}else if(point.x>=Math.min(sh.x,sh.x+sh.w)-12 && point.x<=Math.max(sh.x,sh.x+sh.w)+12 && point.y>=Math.min(sh.y,sh.y+sh.h)-12 && point.y<=Math.max(sh.y,sh.y+sh.h)+12) return i;
    }
    return -1;
  }
  function logoHit(point) { if(!logoImage)return false; const cw=canvas.clientWidth,ch=canvas.clientHeight,lw=Math.min(cw*.24,logoImage.naturalWidth),lh=lw*logoImage.naturalHeight/logoImage.naturalWidth; return Math.abs(point.x-cw*state.logoX)<=lw/2+8 && Math.abs(point.y-ch*state.logoY)<=lh/2+8; }
  function findText(point) {
    if(!state.texto) return false;
    const x=canvas.clientWidth*state.textX, y=canvas.clientHeight*state.textY;
    return Math.abs(point.x-x)<Math.max(65,state.texto.length*state.textSize*.32) && Math.abs(point.y-y)<state.textSize*1.6;
  }
  function selectedCenter() {
    if(selectedObject?.type==='shape') { const sh=state.shapes[selectedObject.index]; if(sh)return{x:sh.x+sh.w/2,y:sh.y+sh.h/2}; }
    if(selectedObject?.type==='logo')return{x:canvas.clientWidth*state.logoX,y:canvas.clientHeight*state.logoY};
    return{x:canvas.clientWidth*state.textX,y:canvas.clientHeight*state.textY};
  }
  function clearSelection(){selectedObject=null;render();}
  function removeSelected() {
    if(!selectedObject){notify('Selecciona primero un objeto del lienzo.',true);return;}
    if(selectedObject.type==='shape')state.shapes.splice(selectedObject.index,1);
    if(selectedObject.type==='text'){state.texto='';const f=$('#designText');if(f)f.value='';}
    if(selectedObject.type==='logo'){logoImage=null;logoFile=null;const f=$('#logoUpload');if(f)f.value='';}
    selectedObject=null;render();refreshLayerList();saveHistory();notify('Elemento eliminado.');
  }
  $('#deleteSelected')?.addEventListener('click',removeSelected);
  window.addEventListener('keydown',e=>{
    if((e.key==='Delete'||e.key==='Backspace')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')&&selectedObject){e.preventDefault();removeSelected();}
  });

  $$('.tool-rail button[data-tool]').forEach(button=>button.addEventListener('click',()=>{
    selectOne('.tool-rail button[data-tool]',button);
    state.herramienta=button.dataset.tool;
    if(state.herramienta==='Texto'){
      const value=window.prompt('Escribe el texto que quieres añadir:');
      if(value&&value.trim()){state.texto=value.trim().slice(0,160);state.textX=.5;state.textY=.48;selectedObject={type:'text'};const f=$('#designText');if(f)f.value=state.texto;render();refreshLayerList();saveHistory();notify('Texto añadido. Arrástralo para colocarlo.');}
    } else if(state.herramienta==='Imagen') $('#logoUpload')?.click();
    else if(state.herramienta==='Zoom') setZoom(state.zoom+.1);
    else if(state.herramienta==='Restablecer') resetDesign();
    canvas.style.cursor=['Pincel','Borrador','Balde'].includes(state.herramienta)?'crosshair':state.herramienta==='Texto'?'text':'default';
    if(!['Texto','Imagen','Zoom','Restablecer'].includes(state.herramienta))notify(`Herramienta activa: ${state.herramienta}`);
  }));

  function paintBucketAt(point) {
    if (!imageReady || !imageBounds) { notify('Primero selecciona una prenda.', true); return; }
    // Si el clic cae sobre una forma, el balde cambia su relleno.
    const shapeIndex = findShape(point);
    if (shapeIndex >= 0) { const shape = state.shapes[shapeIndex]; shape.color = state.shapeColor; shape.fillColor = state.shapeColor; shape.filled = true; selectedObject={type:'shape',index:shapeIndex}; render(); saveHistory(); refreshLayerList(); notify('Forma rellenada con el color elegido.'); return; }
    const nx = Math.floor((point.x-imageBounds.x) / imageBounds.w * garment.naturalWidth);
    const ny = Math.floor((point.y-imageBounds.y) / imageBounds.h * garment.naturalHeight);
    if (nx<0 || ny<0 || nx>=garment.naturalWidth || ny>=garment.naturalHeight) { notify('Haz clic dentro de la prenda o de una forma.',true); return; }
    try {
      const src=document.createElement('canvas'); src.width=garment.naturalWidth; src.height=garment.naturalHeight;
      const sc=src.getContext('2d',{willReadFrequently:true}); sc.drawImage(garment,0,0);
      const data=sc.getImageData(0,0,src.width,src.height).data, pos=(ny*src.width+nx)*4, target=[data[pos],data[pos+1],data[pos+2]];
      if(data[pos+3]<35){notify('Haz clic sobre una zona visible de la prenda.',true);return;}
      const total=src.width*src.height, seen=new Uint8Array(total), stack=[ny*src.width+nx], mask=document.createElement('canvas'); mask.width=src.width; mask.height=src.height;
      const mc=mask.getContext('2d'), md=mc.createImageData(src.width,src.height), tolerance=46; let count=0;
      while(stack.length && count<total){const p=stack.pop();if(p<0||p>=total||seen[p])continue;seen[p]=1;const k=p*4;if(data[k+3]<35)continue;
        const dr=data[k]-target[0],dg=data[k+1]-target[1],db=data[k+2]-target[2];if(dr*dr+dg*dg+db*db>tolerance*tolerance*3)continue;
        md.data[k]=255;md.data[k+1]=255;md.data[k+2]=255;md.data[k+3]=255;count++;
        const x=p%src.width,y=(p/src.width)|0;if(x>0)stack.push(p-1);if(x<src.width-1)stack.push(p+1);if(y>0)stack.push(p-src.width);if(y<src.height-1)stack.push(p+src.width);
      }
      if(count<8){notify('No se encontró una zona para rellenar.',true);return;}
      mc.putImageData(md,0,0);state.paintRegions.push({mask:mask.toDataURL('image/png'),color:state.shapeColor});render();saveHistory();notify('Zona de la prenda pintada. Puedes seguir usando el balde en otras zonas.');
    } catch(err) { notify('No se pudo rellenar esta imagen. Comprueba que sea una imagen local del proyecto.',true); }
  }

  canvas.addEventListener('pointerdown',event=>{
    const point=canvasPoint(event);
    if(state.herramienta==='Balde'){paintBucketAt(point);return;}
    if(['Rectangulo','Cuadrado','Circulo'].includes(state.herramienta)){
      shapeStart=point;activeShape={type:state.herramienta==='Circulo'?'circle':'rect',x:point.x,y:point.y,w:0,h:0,color:state.shapeColor,fillColor:state.shapeColor,filled:true,width:state.shapeWidth};
      state.shapes.push(activeShape);selectedObject={type:'shape',index:state.shapes.length-1};canvas.setPointerCapture(event.pointerId);return;
    }
    if(['Pincel','Borrador'].includes(state.herramienta)){
      activeStroke={erase:state.herramienta==='Borrador',color:state.brushColor,size:state.brushSize,points:[{x:point.x/canvas.clientWidth,y:point.y/canvas.clientHeight}]};
      state.strokes.push(activeStroke);canvas.setPointerCapture(event.pointerId);render();return;
    }
    if(state.herramienta==='Texto')return;
    if(state.herramienta==='Rotar'){
      const hitText=findText(point),hitLogo=logoHit(point);
      const idx=findShape(point);selectedObject=hitLogo?{type:'logo'}:hitText?{type:'text'}:idx>=0?{type:'shape',index:idx}:null;
      if(!selectedObject){notify('Selecciona un texto, imagen o forma para girarlo.',true);return;}
      const c=selectedCenter();rotateStartAngle=Math.atan2(point.y-c.y,point.x-c.x);rotatingObject=true;canvas.setPointerCapture(event.pointerId);return;
    }
    const hitLogo=logoHit(point);
    const hitText=findText(point),idx=findShape(point);
    selectedObject=hitLogo?{type:'logo'}:hitText?{type:'text'}:idx>=0?{type:'shape',index:idx}:null;
    if(!selectedObject){render();return;}
    if(selectedObject.type==='logo')draggingLogo=true;
    else if(selectedObject.type==='text')draggingText=true;
    else {draggingShape=true;const sh=state.shapes[selectedObject.index];dragOffset={x:point.x-sh.x,y:point.y-sh.y};}
    canvas.setPointerCapture(event.pointerId);render();
  });
  canvas.addEventListener('pointermove',event=>{
    const point=canvasPoint(event);
    if(activeShape&&shapeStart){let dx=point.x-shapeStart.x,dy=point.y-shapeStart.y;if(state.herramienta==='Cuadrado'){const side=Math.max(Math.abs(dx),Math.abs(dy));dx=Math.sign(dx||1)*side;dy=Math.sign(dy||1)*side;}activeShape.x=Math.min(shapeStart.x,shapeStart.x+dx);activeShape.y=Math.min(shapeStart.y,shapeStart.y+dy);activeShape.w=Math.abs(dx);activeShape.h=Math.abs(dy);render();return;}
    if(activeStroke){activeStroke.points.push({x:Math.max(0,Math.min(1,point.x/canvas.clientWidth)),y:Math.max(0,Math.min(1,point.y/canvas.clientHeight))});render();return;}
    if(draggingLogo){state.logoX=Math.max(.03,Math.min(.97,point.x/canvas.clientWidth));state.logoY=Math.max(.03,Math.min(.97,point.y/canvas.clientHeight));render();return;}
    if(draggingText){state.textX=Math.max(.03,Math.min(.97,point.x/canvas.clientWidth));state.textY=Math.max(.03,Math.min(.97,point.y/canvas.clientHeight));render();return;}
    if(draggingShape&&selectedObject?.type==='shape'){const sh=state.shapes[selectedObject.index];if(sh){sh.x=point.x-dragOffset.x;sh.y=point.y-dragOffset.y;render();}return;}
    if(rotatingObject&&selectedObject){const c=selectedCenter(),a=Math.atan2(point.y-c.y,point.x-c.x),delta=(a-rotateStartAngle)*180/Math.PI;if(selectedObject.type==='text')state.textRotation=(state.textRotation+delta+360)%360;else if(selectedObject.type==='shape'){const sh=state.shapes[selectedObject.index];if(sh)sh.rotation=(sh.rotation||0)+delta;}else state.logoRotation=(state.logoRotation||0)+delta;rotateStartAngle=a;render();}
  });
  function finishCanvasAction(){
    const changed=!!(activeShape||activeStroke||draggingLogo||draggingText||draggingShape||rotatingObject);
    activeShape=null;shapeStart=null;activeStroke=null;draggingLogo=false;draggingText=false;draggingShape=false;rotatingObject=false;
    if(changed){saveHistory();refreshLayerList();}
  }
  canvas.addEventListener('pointerup',finishCanvasAction);canvas.addEventListener('pointercancel',finishCanvasAction);

  $('#shapeColor')?.addEventListener('input',e=>{state.shapeColor=e.target.value;state.brushColor=e.target.value;});
  $('#shapeWidth')?.addEventListener('input',e=>{state.shapeWidth=Number(e.target.value);state.brushSize=state.shapeWidth;});
  $('#logoUpload')?.addEventListener('change',e=>{
    const file=e.target.files?.[0];if(!file)return;
    if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)||file.size>5*1024*1024){notify('Usa PNG, JPG, WebP o SVG de máximo 5 MB.',true);e.target.value='';return;}
    logoFile=file;const reader=new FileReader();reader.onload=()=>{logoImage=new Image();logoImage.onload=()=>{selectedObject={type:'logo'};render();refreshLayerList();saveHistory();notify('Imagen añadida. Arrástrala para colocarla.');};logoImage.onerror=()=>notify('No se pudo abrir la imagen.',true);logoImage.src=reader.result;};reader.readAsDataURL(file);
  });
  $('#removeLogo')?.addEventListener('click',()=>{logoImage=null;logoFile=null;selectedObject=null;const f=$('#logoUpload');if(f)f.value='';render();saveHistory();});
  $('#editorThemeToggle')?.addEventListener('click',()=>{const light=document.body.classList.toggle('editor-light');const btn=$('#editorThemeToggle');btn.textContent=light?'☾ Modo oscuro':'☀ Modo claro';btn.setAttribute('aria-pressed',String(light));try{localStorage.setItem('dtp-editor-theme',light?'light':'dark');}catch(e){} });
  try{if(localStorage.getItem('dtp-editor-theme')==='light'){document.body.classList.add('editor-light');const b=$('#editorThemeToggle');if(b){b.textContent='☾ Modo oscuro';b.setAttribute('aria-pressed','true');}}}catch(e){}
  $('#toggleCatalog')?.addEventListener('click',()=>document.querySelector('.designer-grid')?.classList.toggle('catalog-hidden'));
  $('#hideOptions')?.addEventListener('click',()=>document.querySelector('.options-panel')?.classList.toggle('options-collapsed'));
  $('#zoomIn')?.addEventListener('click',()=>setZoom(state.zoom+.1));
  $('#zoomOut')?.addEventListener('click',()=>setZoom(state.zoom-.1));
  $('#zoomLabel')?.addEventListener('click',()=>setZoom(1));
  $('#fullscreen')?.addEventListener('click',async()=>{try{if(!document.fullscreenElement)await stage.requestFullscreen();else await document.exitFullscreen();}catch{notify('El navegador no permitió pantalla completa.',true);}});

  async function activate3D(url) {
    let host=$('#threeStage'); if(!host){host=document.createElement('div');host.id='threeStage';host.className='three-stage';stage.appendChild(host);}
    $('#designerCanvas').hidden=true; host.hidden=false; host.innerHTML='';
    try {
      const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
      const {GLTFLoader}=await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
      if(threeRenderer){threeRenderer.dispose();threeRenderer=null;} host.innerHTML='';
      const scene=new THREE.Scene(); scene.background=new THREE.Color(0xe7e9ef);
      const camera=new THREE.PerspectiveCamera(35,host.clientWidth/Math.max(1,host.clientHeight),.1,100); camera.position.set(0,1.2,4);
      threeRenderer=new THREE.WebGLRenderer({antialias:true,alpha:false}); threeRenderer.setPixelRatio(Math.min(devicePixelRatio,2)); threeRenderer.setSize(host.clientWidth,host.clientHeight); host.appendChild(threeRenderer.domElement);
      scene.add(new THREE.HemisphereLight(0xffffff,0x777788,2)); const light=new THREE.DirectionalLight(0xffffff,2); light.position.set(3,5,4); scene.add(light);
      const loader=new GLTFLoader(); loader.load(url,g=>{const obj=g.scene; currentThreeModel=obj; scene.add(obj); const box=new THREE.Box3().setFromObject(obj); const size=box.getSize(new THREE.Vector3()); const center=box.getCenter(new THREE.Vector3()); obj.position.sub(center); camera.position.set(0,Math.max(size.y,1)*.45,Math.max(size.x,size.y,size.z)*2.6); camera.lookAt(0,0,0); let dragging=false,lastX=0; threeRenderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;threeRenderer.domElement.setPointerCapture(e.pointerId)}); threeRenderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;obj.rotation.y+=(e.clientX-lastX)*.01;lastX=e.clientX;}); threeRenderer.domElement.addEventListener('pointerup',()=>dragging=false); const spin=()=>{threeFrame=requestAnimationFrame(spin);threeRenderer.render(scene,camera);};spin();},undefined,err=>{host.innerHTML='<p class="three-empty">No se pudo cargar el modelo 3D. Comprueba que sea un GLB/GLTF válido.</p>';notify('Error al cargar el modelo 3D.',true);});
      notify('Modelo 3D cargado. Arrastra el ratón para inspeccionar el modelo.');
    } catch(err) { host.innerHTML='<p class="three-empty">No se pudo iniciar el visor 3D. Comprueba tu conexión para cargar Three.js.</p>'; notify('No se pudo iniciar el visor 3D.',true); }
  }
  $$('.view-switch button').forEach(button => button.addEventListener('click', () => {
    selectOne('.view-switch button', button);
    if (button.dataset.view === '3D') { const f=$('#model3DUpload')?.files?.[0]; if(model3DObjectUrl) activate3D(model3DObjectUrl); else if(f){model3DObjectUrl=URL.createObjectURL(f);activate3D(model3DObjectUrl);} else { let host=$('#threeStage'); if(!host){host=document.createElement('div');host.id='threeStage';host.className='three-stage';stage.appendChild(host);} host.hidden=false;host.innerHTML='<p class="three-empty">Carga un archivo GLB/GLTF desde el panel derecho para ver tu prenda en 3D.</p>'; $('#designerCanvas').hidden=true; } }
    else { $('#designerCanvas').hidden=false; if($('#threeStage'))$('#threeStage').hidden=true; notify('Editor 2D activo.'); }
  }));

  function snapshot() {
    return JSON.stringify({ ...state });
  }
  function saveHistory() {
    if (historyIndex >= 0 && history[historyIndex] === snapshot()) return;
    history = history.slice(0, historyIndex + 1); history.push(snapshot());
    if (history.length > 40) history.shift();
    historyIndex = history.length - 1;
    updateHistoryButtons();
  }
  function restoreHistory(index) {
    if (index < 0 || index >= history.length) return;
    Object.assign(state, JSON.parse(history[index]));
    $('#designText').value = state.texto; $('#designSize').value = state.talla; $('#designTextPosition').value = state.posicion;
    render(); historyIndex = index; updateHistoryButtons(); refreshLayerList();
  }
  function updateHistoryButtons() {
    $('#undoDesign')?.toggleAttribute('disabled', historyIndex <= 0);
    $('#redoDesign')?.toggleAttribute('disabled', historyIndex >= history.length - 1);
  }
  function refreshLayerList() {
    const host = $('#layersList'); if (!host) return;
    const layers = [];
    if (state.texto) layers.push({type:'text', name:`Texto: ${state.texto.slice(0,22)}`, icon:'T'});
    if (logoImage) layers.push({type:'logo', name:'Imagen / logotipo', icon:'▧'});
    (state.shapes || []).forEach((shape, index) => layers.push({type:'shape', index, name:shape.type === 'circle' ? 'Círculo' : 'Forma vectorial', icon:shape.type === 'circle' ? '◯' : '▱'}));
    host.innerHTML = '';
    if (!layers.length) { host.innerHTML = '<p class="layers-empty">Añade texto, formas o imágenes para crear capas.</p>'; return; }
    layers.forEach(layer => {
      const active = selectedObject && selectedObject.type === layer.type && (layer.type !== 'shape' || selectedObject.index === layer.index);
      const button = document.createElement('button'); button.type='button'; button.className='layer-item' + (active ? ' active' : '');
      const icon = document.createElement('span'); icon.className='layer-kind'; icon.textContent=layer.icon;
      const name = document.createElement('span'); name.textContent=layer.name;
      button.append(icon,name); button.addEventListener('click',()=>{selectedObject=layer.type==='shape'?{type:'shape',index:layer.index}:{type:layer.type};render();refreshLayerList();});
      host.append(button);
    });
  }
  function duplicateSelected() {
    if (!selectedObject) { notify('Selecciona un elemento para duplicarlo.', true); return; }
    if (selectedObject.type === 'shape') {
      const original=state.shapes[selectedObject.index]; if(!original)return;
      const copy={...original,x:original.x+18,y:original.y+18}; state.shapes.push(copy); selectedObject={type:'shape',index:state.shapes.length-1};
    } else if (selectedObject.type === 'text' && state.texto) {
      state.textX=Math.min(.9,state.textX+.06);state.textY=Math.min(.9,state.textY+.06);
    } else if (selectedObject.type === 'logo' && logoImage) {
      state.logoX=Math.min(.9,state.logoX+.06);state.logoY=Math.min(.9,state.logoY+.06);
    }
    render();refreshLayerList();saveHistory();notify('Elemento duplicado.');
  }
  function moveShapeLayer(direction) {
    if (!selectedObject || selectedObject.type !== 'shape') { notify('Selecciona una forma para cambiar su orden.', true); return; }
    const from=selectedObject.index,to=Math.max(0,Math.min(state.shapes.length-1,from+direction));
    if(from===to)return;
    const [item]=state.shapes.splice(from,1);state.shapes.splice(to,0,item);selectedObject={type:'shape',index:to};render();refreshLayerList();saveHistory();
  }
  function moveEditorPanels() {
    const target=$('.options-scroll'); if(!target)return;
    ['.color-panel','.pattern-panel','.action-panel'].forEach(selector=>{const panel=$(selector);if(panel&&panel.parentElement!==target)target.append(panel);});
  }
  $('#duplicateSelected')?.addEventListener('click',duplicateSelected);
  $('#layerUp')?.addEventListener('click',()=>moveShapeLayer(1));
  $('#layerDown')?.addEventListener('click',()=>moveShapeLayer(-1));
  $('#objectColor')?.addEventListener('input',event=>{
    const color=event.target.value;
    if(selectedObject?.type==='shape'){const sh=state.shapes[selectedObject.index];if(sh)sh.color=color;}
    else if(selectedObject?.type==='text')state.textColor=color;
    else if(selectedObject?.type==='logo'){notify('El color de una imagen se cambia editando el archivo original.',true);return;}
    else {state.shapeColor=color;state.brushColor=color;}
    render();refreshLayerList();
  });
  $('#textSizeControl')?.addEventListener('input',event=>{state.textSize=Number(event.target.value);$('#textSizeValue').textContent=`${state.textSize} px`;render();});
  $('#textFont')?.addEventListener('change',event=>{state.textFont=event.target.value;render();saveHistory();});
  $('#designText')?.addEventListener('input',()=>{state.texto=$('#designText').value;render();refreshLayerList();});
  window.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();restoreHistory(historyIndex+(event.shiftKey?1:-1));}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){event.preventDefault();restoreHistory(historyIndex+1);}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'){event.preventDefault();duplicateSelected();}
  });

  function addHistoryControls() {
    const controls = $('.zoom-controls'); if (!controls) return;
    const download = document.createElement('button'); download.type = 'button'; download.id = 'downloadDesign'; download.textContent = '↓ PNG'; download.title = 'Descargar vista previa';
    download.addEventListener('click', () => {
      if (!imageReady) { notify('Selecciona una prenda antes de descargar.', true); return; }
      const link = document.createElement('a'); link.download = 'disenatuprenda-vista-previa.png'; link.href = canvas.toDataURL('image/png'); link.click();
    });
    controls.append(download);
    const undo = document.createElement('button'); undo.type = 'button'; undo.id = 'undoDesign'; undo.textContent = '↶'; undo.title = 'Deshacer'; undo.setAttribute('aria-label', 'Deshacer');
    const redo = document.createElement('button'); redo.type = 'button'; redo.id = 'redoDesign'; redo.textContent = '↷'; redo.title = 'Rehacer'; redo.setAttribute('aria-label', 'Rehacer');
    controls.prepend(redo); controls.prepend(undo);
    undo.addEventListener('click', () => restoreHistory(historyIndex - 1));
    redo.addEventListener('click', () => restoreHistory(historyIndex + 1));
  }
  function resetDesign() {
    state.color = 'Rosa'; state.colorHex = palette.Rosa; state.tela = 'Algodón'; state.patron = 'Floral';
    state.texto = ''; state.posicion = 'Pecho'; state.zoom = 1; state.strokes = []; state.shapes = []; state.textX = 0.5; state.textY = 0.42; state.textRotation = 0; state.logoRotation=0; state.logoX=.72; state.logoY=.72; logoImage=null; logoFile=null; selectedObject=null;
    $('#designText').value = ''; $('#designTextPosition').value = 'Pecho';
    selectOne('.swatch', $('.swatch[aria-label="Rosa"]')); selectOne('.fabric-row button', $('.fabric-row button:nth-child(2)'));
    selectOne('.pattern', $('.pattern[aria-label="Floral"]'));
    render(); setZoom(1); saveHistory(); notify('Opciones restablecidas.');
  }
  $('#editButton')?.addEventListener('click', () => $('.options-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  $$('.step-tabs button').forEach(button => button.addEventListener('click', () => {
    selectOne('.step-tabs button', button);
    const targets = { 1: '.layer-tools', 2: '.fabric-row', 3: '.pattern-panel', 4: '#saveDesign' };
    $(targets[button.dataset.step])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));

  function getDescription() {
    return [
      `Modelo: ${state.modelo}`, `Talla: ${state.talla}`, `Color: ${state.color}`,
      `Tela: ${state.tela}`, `Patrón: ${state.patron}`,
      
    ].join(' | ');
  }
  async function canvasBlob() {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.86));
  }
  async function save(mode) {
    if (!state.prendaId || !state.modelo) { notify('Primero selecciona una prenda del catálogo.', true); return; }
    const button = mode === 'diseno' ? $('#saveDesign') : $('#addCart');
    if (button.disabled) return;
    const csrf = $('#designCsrf')?.value || '';
    if (!csrf) { notify('No se encontró el token de seguridad. Actualiza la página.', true); return; }
    button.disabled = true; const originalLabel = button.textContent; button.textContent = 'Guardando…';
    notify('Preparando y guardando tu diseño…');
    try {
      const form = new FormData();
      form.append('csrf', csrf); form.append('modo', mode); form.append('modelo', state.modelo);
      form.append('prenda_id', String(state.prendaId)); form.append('talla', state.talla);
      form.append('color', state.color); form.append('tela', state.tela);
      form.append('texto_personalizado', state.texto); form.append('ubicacion_texto', state.posicion);
      form.append('descripcion', getDescription());
      form.append('personalizacion_json', JSON.stringify({ ...state, canvasWidth: canvas.clientWidth, canvasHeight: canvas.clientHeight }));
      const blob = await canvasBlob();
      if (blob) form.append('vista_previa', blob, 'vista-previa.jpg');
      if (referenceFile) form.append('referencia', referenceFile);
      if (logoFile) form.append('logotipo', logoFile, logoFile.name);
      const response = await fetch('index.php?r=guardar_diseno', { method: 'POST', body: form, credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
      const responseText = await response.text();
      let data;
      try { data = JSON.parse(responseText); } catch { throw new Error('El servidor no devolvió una respuesta válida. Revisa PHP y la base de datos.'); }
      if (!response.ok || !data.ok) throw new Error(data.mensaje || `Error HTTP ${response.status}`);
      notify(data.mensaje || 'Diseño guardado correctamente.');
    } catch (error) {
      notify(error.message || 'No se pudo guardar. Comprueba la conexión con el servidor.', true);
    } finally { button.disabled = false; button.textContent = originalLabel; }
  }
  $('#saveDesign')?.addEventListener('click', () => save('diseno'));
  $('#addCart')?.addEventListener('click', () => save('solicitud'));

  moveEditorPanels();
  addHistoryControls();
  refreshLayerList();
  const initial = $('.model-card.chosen');
  if (initial) { state.prendaId = Number(initial.dataset.prendaId || 0); state.modelo = initial.dataset.model || ''; }
  const resizeObserver = new ResizeObserver(resizeCanvas); resizeObserver.observe(stage);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  if (initial?.dataset.img) loadGarment(initial.dataset.img);
  saveHistory();
})();
