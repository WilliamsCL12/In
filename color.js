let totalPages = 0;
let fileNameGlobal = ''; // Para mantener el nombre del archivo
let totalAmount = 0; // Variable global para almacenar el total a pagar
let totalPageCount = 0; // Total de páginas
let totalBindingCount = 0; // Total de engargolados
let customerName = ''; // Nombre del cliente global
let customerPhone = ''; // Teléfono del cliente global

document.getElementById('uploadButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        fileNameGlobal = file.name; // Guardar el nombre del archivo
        const fileName = document.getElementById('fileName');
        const numPages = document.getElementById('numPages');
        const quoteSection = document.getElementById('quoteSection');
        
        const reader = new FileReader();
        
        reader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                totalPages = pdf.numPages; // Asigna el valor del número de páginas a la variable global
                
                fileName.textContent = `Nombre del archivo: ${file.name}`;
                numPages.textContent = `Número de páginas: ${totalPages}`;
                
                quoteSection.classList.remove('hidden');
            });
        };
        
        reader.readAsArrayBuffer(file);
    } else {
        alert('Por favor, sube un archivo.');
    }
});

document.getElementById('allBind').addEventListener('change', () => {
    document.getElementById('numBindCopies').classList.add('hidden');
});

document.getElementById('someBind').addEventListener('change', () => {
    document.getElementById('numBindCopies').classList.remove('hidden');
});

document.getElementById('calculateButton').addEventListener('click', () => {
    const numCopies = parseInt(document.getElementById('numCopies').value);
    const isDoubleSided = document.querySelector('input[name="printType"]:checked').value === 'double';
    const bindingOption = document.getElementById('bindingOption').value;
    const quote = document.getElementById('quote');
    const bindAll = document.getElementById('allBind').checked;
    const numBindCopies = bindAll ? numCopies : parseInt(document.getElementById('numBindCopiesInput').value);
    customerName = document.getElementById('customerName').value;
    customerPhone = document.getElementById('customerPhone').value;

    const totalPrintedPages = totalPages * numCopies; // Total de páginas impresas
    
    // Cálculo de la cotización basado en las reglas proporcionadas
    let pricePerPage = 0;
    if (isDoubleSided) {
        if (totalPrintedPages <= 24) {
            pricePerPage = 6.00;
        } else if (totalPrintedPages <= 49) {
            pricePerPage = 5.00;
        } else if (totalPrintedPages <= 99) {
            pricePerPage = 4.00;
        } else {
            pricePerPage = 2.00;
        }
    }else{
        if (totalPrintedPages <= 24) {
            pricePerPage = 6.00;
        } else if (totalPrintedPages <= 49) {
            pricePerPage = 5.00;
        } else if (totalPrintedPages <= 99) {
            pricePerPage = 4.00;
        } else {
            pricePerPage = 2.00;
        }
    }
    
    const bindingPrices = {
        "Engargolado #8": { base: 16, bulk: { 25: 15, 50: 14 } },
        "Engargolado #11": { base: 18, bulk: { 25: 17, 50: 16 } },
        "Engargolado #12": { base: 18, bulk: { 25: 17, 50: 16 } },
        "Engargolado #14": { base: 20, bulk: { 25: 19, 50: 18 } },
        "Engargolado #16": { base: 20, bulk: { 25: 19, 50: 18 } },
        "Engargolado #20": { base: 24, bulk: { 25: 23, 50: 22 } },
        "Engargolado #23": { base: 24, bulk: { 25: 23, 50: 22 } },
        "Engargolado #25": { base: 24, bulk: { 25: 23, 50: 22 } },
        "Engargolado #30": { base: 30, bulk: { 25: 29, 50: 29 } },
        "Engargolado #38": { base: 30, bulk: { 25: 29, 50: 28 } },
        "Engargolado #40": { base: 38, bulk: { 25: 31, 50: 30 } }
    };

    let bindingPrice = bindingPrices[bindingOption] ? bindingPrices[bindingOption].base : 0;
    if (bindingPrices[bindingOption]) {
        if (numBindCopies >= 50) {
            bindingPrice = bindingPrices[bindingOption].bulk[50];
        } else if (numBindCopies >= 25) {
            bindingPrice = bindingPrices[bindingOption].bulk[25];
        }
    }

    const totalQuote = (pricePerPage * totalPrintedPages) + (bindingPrice * numBindCopies);
    quote.textContent = `Cotización total para ${numCopies} juegos (${totalPrintedPages} páginas): $${totalQuote.toFixed(2)} (Incluyendo $${bindingPrice * numBindCopies} por ${numBindCopies} engargolados)`;

    // Añadir los datos a la tabla de historial
    const quoteTableBody = document.getElementById('quoteTable').querySelector('tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${fileNameGlobal}</td>
        <td>${totalPages}</td>
        <td>${numCopies}</td>
        <td>${numBindCopies}</td>
        <td>${isDoubleSided ? 'Ambos lados' : 'Un solo lado'}</td>
        <td>${bindingOption}</td>
        <td>$${totalQuote.toFixed(2)}</td>
    `;
    quoteTableBody.appendChild(newRow);

    // Mostrar los datos del cliente
    document.getElementById('customerData').textContent = `Nombre del cliente: ${customerName}, Teléfono: ${customerPhone}`;

    // Actualizar el total a pagar
    totalAmount += totalQuote;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;

    // Actualizar el total de páginas y engargolados
    totalPageCount += totalPrintedPages;
    totalBindingCount += numBindCopies;
    document.getElementById('totalPagesAndBinding').textContent = `Total de Páginas: ${totalPageCount}, Total de Engargolados: ${totalBindingCount}`;
});

document.getElementById('printButton').addEventListener('click', () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const tableHtml = document.getElementById('quoteTable').outerHTML;
    const customerDataHtml = document.getElementById('customerData').outerHTML;
    const totalAmountHtml = document.getElementById('totalAmount').outerHTML;
    const legendHtml = `<p><strong>Nota:</strong> Los precios están sujetos a cambios. Por favor, vuelva a preguntar sobre la veracidad de la cotización.</p>
                        <p>Para poder realizar la impresion o copia de su trabajo requerimos un 50% de anticipo</p>`;

    printWindow.document.write('<html><head><title>Imprimir Cotizaciones</title>');
    printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid black; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } </style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2>Datos del Cliente</h2>');
    printWindow.document.write(customerDataHtml);
    printWindow.document.write('<h2>Total a Pagar</h2>');
    printWindow.document.write(totalAmountHtml);
    printWindow.document.write('<h2>Historial de Cotizaciones</h2>');
    printWindow.document.write(tableHtml);
    printWindow.document.write(legendHtml);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
});
