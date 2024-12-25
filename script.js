class PizarraDigital {
    constructor() {
        this.canvas = new fabric.Canvas('drawing-canvas', { isDrawingMode: false });
        this.pages = [{}];
        this.currentPage = 0;
        this.history = [];
        this.currentStateIndex = -1;
        this.isUndoRedoAction = false;
        this.zoom = 1;
        this.clipboard = null; // Portapapeles para copiar/pegar objetos
        this.init();
    }

    init() {
this.cacheElements();
this.bindEvents();
this.resizeCanvas();
window.addEventListener('resize', () => this.resizeCanvas());
this.savePage();
// Ocultar el botón al inicio si la barra está visible
if (this.toolbar.style.display !== 'none') {
this.showToolbarButton.style.display = 'none';
}

// Escuchar los eventos de teclado para deshacer y rehacer
document.addEventListener('keydown', (event) => {
if (event.ctrlKey && event.key === 'z') this.undo();  // Ctrl + Z para deshacer
if (event.ctrlKey && event.key === 'y') this.redo(); // Ctrl + Y para rehacer
if (event.ctrlKey && event.key === 'c') this.copy();  // Ctrl+C para copiar
if (event.ctrlKey && event.key === 'v') this.paste(); // Ctrl+V para pegar
});
}

 // Función para copiar el objeto seleccionado
 copy() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
        activeObject.clone((cloned) => {
            this.clipboard = cloned; // Guardar en el portapapeles
        });
    }
}

// Función para pegar el objeto copiado
paste() {
    if (this.clipboard) {
        this.clipboard.clone((clonedObj) => {
            this.canvas.discardActiveObject(); // Deseleccionar el objeto actual
            clonedObj.set({
                left: clonedObj.left + 10, // Desplazar ligeramente el objeto
                top: clonedObj.top + 10,
                evented: true, // Hacer que sea interactivo
            });
            this.canvas.add(clonedObj); // Agregar al canvas
            this.canvas.setActiveObject(clonedObj); // Seleccionarlo
            this.canvas.requestRenderAll(); // Renderizar el canvas
            this.saveState(); // Guardar el estado
        });
    }
}

    cacheElements() {
        this.pencilButton = document.getElementById('draw-pencil');
        this.rectangleButton = document.getElementById('draw-rectangle');
        this.circleButton = document.getElementById('draw-circle');
        this.addTextButton = document.getElementById('add-text');
        this.moveButton = document.getElementById('move');
        this.eraseButton = document.getElementById('erase');
        this.clearButton = document.getElementById('clear-canvas');
        this.colorPicker = document.getElementById('color-picker');
        this.borderColorPicker = document.getElementById('border-color-picker');
        this.sizePicker = document.getElementById('size-picker');
        this.marginPicker = document.getElementById('margin-picker');
        this.uploadImageButton = document.getElementById('upload-image');
        this.imageInput = document.getElementById('image-input');
        this.undoButton = document.getElementById('undo');
        this.redoButton = document.getElementById('redo');
        this.zoomInButton = document.getElementById('zoom-in');
        this.zoomOutButton = document.getElementById('zoom-out');
        this.exportButton = document.getElementById('export');
        this.saveProjectButton = document.getElementById('save-project');
        this.loadProjectInput = document.getElementById('load-project');
        this.importProjectButton = document.getElementById('import-project');
        this.prevPageButton = document.getElementById('prevPage');
        this.nextPageButton = document.getElementById('nextPage');
        this.pageNumber = document.getElementById('pageNumber');
        this.arrowButton = document.getElementById('draw-arrow');
this.triangleButton = document.getElementById('draw-triangle');
this.backgroundPicker = document.getElementById('background-picker');
this.toolbar = document.getElementById('toolbar');
    this.toggleToolbarButton = document.getElementById('toggleToolbar');
    this.showToolbarButton = document.getElementById('showToolbar');

        this.buttons = [
            this.pencilButton,
            this.rectangleButton,
            this.circleButton,
            this.addTextButton,
            this.moveButton,
            this.eraseButton,
            this.arrowButton, // Agregado
            this.triangleButton 
        ];
    }

    bindEvents() {
        this.pencilButton.addEventListener('click', () => this.activatePencil());
        this.rectangleButton.addEventListener('click', () => this.activateRectangle());
        this.circleButton.addEventListener('click', () => this.activateCircle());
        this.addTextButton.addEventListener('click', () => this.activateText());
        this.moveButton.addEventListener('click', () => this.activateMove());
        this.eraseButton.addEventListener('click', () => this.activateErase());
        this.clearButton.addEventListener('click', () => this.clearCanvas());
        this.colorPicker.addEventListener('change', () => this.updateDrawingColor());
        this.sizePicker.addEventListener('input', () => this.updateBrushSize());
        this.uploadImageButton.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.uploadImage(e));
        this.undoButton.addEventListener('click', () => this.undo());
        this.redoButton.addEventListener('click', () => this.redo());
        this.zoomInButton.addEventListener('click', () => this.zoomCanvas(1.1));
        this.zoomOutButton.addEventListener('click', () => this.zoomCanvas(0.9));
        this.exportButton.addEventListener('click', () => this.exportToPDF());
        this.saveProjectButton.addEventListener('click', () => this.saveProject());
        this.loadProjectInput.addEventListener('change', (e) => this.loadProject(e));
        this.importProjectButton.addEventListener('click', () => { this.loadProjectInput.click(); });

this.arrowButton.addEventListener('click', () => this.activateArrow());
this.triangleButton.addEventListener('click', () => this.activateTriangle());
this.backgroundPicker.addEventListener('change', (e) => this.setBackground(e.target.value));

        this.prevPageButton.addEventListener('click', () => this.previousPage());
        this.nextPageButton.addEventListener('click', () => this.nextPage());
        this.toggleToolbarButton.addEventListener('click', () => this.hideToolbar());
    this.showToolbarButton.addEventListener('click', () => this.showToolbar());

    this.btnCambiarColor = document.getElementById('btnCambiarColor');
this.backgroundColorPicker = document.getElementById('backgroundColorPicker');

this.btnCambiarColor.addEventListener('click', () => this.changeCanvasBackground());

    }

    changeCanvasBackground() {
        const selectedColor = this.backgroundColorPicker.value;
        this.canvas.setBackgroundColor(selectedColor, () => {
            this.canvas.renderAll();
        });
        this.saveState(); // Guarda el estado después de cambiar el fondo
    }
    

    hideToolbar() {
this.toolbar.style.display = 'none';
this.showToolbarButton.style.display = 'block'; // Mostrar el botón
}

showToolbar() {
this.toolbar.style.display = 'flex';
this.showToolbarButton.style.display = 'none'; // Ocultar el botón
}

    activateTool(tool) {
        // Desactivar eventos previos
        this.canvas.off('mouse:down');
        this.buttons.forEach(btn => btn.classList.remove('active'));
        tool.classList.add('active');
    }
    resizeCanvas() {
        const container = document.getElementById('canvas-container');
        this.canvas.setWidth(container.offsetWidth);
        this.canvas.setHeight(container.offsetHeight);
        this.restorePage();
        const currentBackground = this.backgroundPicker.value;
if (currentBackground) {
this.setBackground(currentBackground);
}

    }

    setBackground(type) {
this.canvas.clear(); // Limpiar el canvas

const width = this.canvas.getWidth();
const height = this.canvas.getHeight();

if (type === 'grid') {
const gridSize = 25; // Tamaño de los cuadros

// Dibujar las líneas verticales de la cuadrícula
for (let i = 0; i < width; i += gridSize) {
    this.canvas.add(new fabric.Line([i, 0, i, height], {
        stroke: '#ddd',
        selectable: false,
        evented: false
    }));
}

// Dibujar las líneas horizontales de la cuadrícula
for (let j = 0; j < height; j += gridSize) {
    this.canvas.add(new fabric.Line([0, j, width, j], {
        stroke: '#ddd',
        selectable: false,
        evented: false
    }));
}

} else if (type === 'lines') {
const lineSpacing = 25; // Espaciado entre líneas

// Dibujar líneas horizontales
for (let j = 0; j < height; j += lineSpacing) {
    this.canvas.add(new fabric.Line([0, j, width, j], {
        stroke: '#ddd',
        selectable: false,
        evented: false
    }));
}

} else if (type === 'axes') {
// Dibujar el eje horizontal (eje X)
const horizontalAxis = new fabric.Line([0, height / 2, width, height / 2], {
    stroke: '#000', // Color más visible
    selectable: false,
    evented: false
});

// Dibujar el eje vertical (eje Y)
const verticalAxis = new fabric.Line([width / 2, 0, width / 2, height], {
    stroke: '#000', // Color más visible
    selectable: false,
    evented: false
});

this.canvas.add(horizontalAxis, verticalAxis); // Añadir los ejes al canvas
}

// Redibujar el canvas con los cambios
this.canvas.renderAll();
}



    saveState() {
        if (!this.isUndoRedoAction) {
            this.history = this.history.slice(0, this.currentStateIndex + 1);
            this.history.push(this.canvas.toJSON());
            this.currentStateIndex++;
        }
        this.isUndoRedoAction = false;
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.currentStateIndex > 0) {
            this.isUndoRedoAction = true;
            this.currentStateIndex--;
            this.canvas.loadFromJSON(this.history[this.currentStateIndex], () => {
                this.canvas.renderAll();
            });
            this.updateUndoRedoButtons();
        }
    }

    redo() {
        if (this.currentStateIndex < this.history.length - 1) {
            this.isUndoRedoAction = true;
            this.currentStateIndex++;
            this.canvas.loadFromJSON(this.history[this.currentStateIndex], () => {
                this.canvas.renderAll();
            });
            this.updateUndoRedoButtons();
        }
    }

    updateUndoRedoButtons() {
        this.undoButton.disabled = this.currentStateIndex <= 0;
        this.redoButton.disabled = this.currentStateIndex >= this.history.length - 1;
    }

    activatePencil() {
        this.activateTool(this.pencilButton);
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush.color = this.colorPicker.value;
        this.canvas.freeDrawingBrush.width = parseInt(this.sizePicker.value, 10);
    }

    activateRectangle() {
        this.activateTool(this.rectangleButton);
        this.canvas.isDrawingMode = false;
        this.canvas.off('mouse:down');
        this.canvas.on('mouse:down', (options) => {
            const margin = parseInt(this.marginPicker.value, 10);
            const rect = new fabric.Rect({
                left: options.pointer.x,
                top: options.pointer.y,
                width: 50,
                height: 50,
                fill: this.colorPicker.value,
                stroke: this.borderColorPicker.value,
                strokeWidth: margin,
            });
            this.canvas.add(rect);
            this.saveState();
        });
    }

    activateCircle() {
        this.activateTool(this.circleButton);
        this.canvas.isDrawingMode = false;
        this.canvas.off('mouse:down');
        this.canvas.on('mouse:down', (options) => {
            const margin = parseInt(this.marginPicker.value, 10);
            const circle = new fabric.Circle({
                left: options.pointer.x,
                top: options.pointer.y,
                radius: 25,
                fill: this.colorPicker.value,
                stroke: this.borderColorPicker.value,
                strokeWidth: margin,
            });
            this.canvas.add(circle);
            this.saveState();
        });
    }

    activateArrow() {
this.activateTool(this.arrowButton);
this.canvas.isDrawingMode = false;
this.canvas.off('mouse:down');
this.canvas.on('mouse:down', (options) => {
const arrow = new fabric.Path('M 0 0 L 50 25 L 0 50 Z', {
    left: options.pointer.x,
    top: options.pointer.y,
    fill: this.colorPicker.value,
});
this.canvas.add(arrow);
this.saveState();
});
}

activateTriangle() {
this.activateTool(this.triangleButton);
this.canvas.isDrawingMode = false;
this.canvas.off('mouse:down');
this.canvas.on('mouse:down', (options) => {
const margin = parseInt(this.marginPicker.value, 10);
const triangle = new fabric.Triangle({
    left: options.pointer.x,
    top: options.pointer.y,
    width: 50,
    height: 50,
    fill: this.colorPicker.value,
    stroke: this.borderColorPicker.value,
    strokeWidth: margin,
});
this.canvas.add(triangle);
this.saveState();
});
}


    activateText() {
        this.activateTool(this.addTextButton);
        this.canvas.isDrawingMode = false;
        const text = new fabric.Textbox('Texto aquí', {
            left: 50,
            top: 50,
            fontSize: 20,
            fill: this.colorPicker.value,
        });
        this.canvas.add(text);
        this.saveState();
    }

    activateMove() {
        this.activateTool(this.moveButton);
        this.canvas.isDrawingMode = false;
    }

    activateErase() {
        this.activateTool(this.eraseButton);
        this.canvas.isDrawingMode = false;
        this.canvas.on('mouse:down', (options) => {
            const target = this.canvas.findTarget(options.e);
            if (target) {
                this.canvas.remove(target);
                this.saveState();
            }
        });
    }

    clearCanvas() {
        this.canvas.clear();
        this.saveState();
    }

    updateDrawingColor() {
        if (this.canvas.isDrawingMode) {
            this.canvas.freeDrawingBrush.color = this.colorPicker.value;
        }
    }

    updateBrushSize() {
        if (this.canvas.isDrawingMode) {
            this.canvas.freeDrawingBrush.width = parseInt(this.sizePicker.value, 10);
        }
    }

    uploadImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                fabric.Image.fromURL(e.target.result, (img) => {
                    img.scaleToWidth(this.canvas.width / 2);
                    this.canvas.add(img);
                    this.saveState();
                });
            };
            reader.readAsDataURL(file);
        }
    }

    zoomCanvas(factor) {
        this.zoom *= factor;
        this.canvas.setZoom(this.zoom);
        this.canvas.requestRenderAll();
    }

    exportToPDF() {
        const pdf = new jspdf.jsPDF();
        const renderPage = (index) => {
            this.canvas.loadFromJSON(this.pages[index], () => {
                this.canvas.renderAll();
                const canvasData = this.canvas.toDataURL('image/jpeg');
                pdf.addImage(canvasData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
                if (index < this.pages.length - 1) {
                    pdf.addPage();
                    renderPage(index + 1);
                } else {
                    pdf.save('pizarra.pdf');
                }
            });
        };
        renderPage(0);
    }

    saveProject() {
        const data = {
            pages: this.pages,
            currentPage: this.currentPage
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'proyecto.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    loadProject(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = JSON.parse(e.target.result);
                this.pages = data.pages;
                this.currentPage = data.currentPage;
                this.restorePage();
            };
            reader.readAsText(file);
        }
    }

    savePage() {
        this.pages[this.currentPage] = this.canvas.toJSON();
    }

    restorePage() {
        this.canvas.loadFromJSON(this.pages[this.currentPage], () => {
            this.canvas.renderAll();
        });
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.savePage();
            this.currentPage--;
            this.restorePage();
            this.updatePageNumber();
        }
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.savePage();
            this.currentPage++;
            this.restorePage();
            this.updatePageNumber();
        } else {
            // Si estamos en la última página, añade una nueva.
            this.savePage();
            this.pages.push({});
            this.currentPage++;
            this.restorePage();
            this.updatePageNumber();
        }
    }

    updatePageNumber() {
        this.pageNumber.textContent = `Página: ${this.currentPage + 1}`;
    }
}





// Inicializa la pizarra digital al cargar la página.
window.onload = () => {
    const pizarra = new PizarraDigital();
};