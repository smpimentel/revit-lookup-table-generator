// Parameter store
let parameters = [];

// Unit options for each parameter type
const UNIT_OPTIONS = {
    NUMBER: ['GENERAL', 'PERCENTAGE'],
    LENGTH: ['INCHES', 'FEET'],
    AREA: ['SQUARE_FEET'],
    VOLUME: ['CUBIC_FEET'],
    ANGLE: ['DEGREES'],
    OTHER: ['GENERAL']
};

// Update unit select options based on parameter type
document.getElementById('paramType').addEventListener('change', function(e) {
    const unitSelect = document.getElementById('paramUnit');
    const units = UNIT_OPTIONS[e.target.value] || [];
    unitSelect.innerHTML = units.map(unit => 
        `<option value="${unit}">${unit.replace('_', ' ')}</option>`
    ).join('');
});

// Trigger initial unit options population
document.getElementById('paramType').dispatchEvent(new Event('change'));

// Add new parameter
document.getElementById('parameterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('paramName').value.trim();
    if (!name) return;

    const parameter = {
        id: Date.now().toString(),
        name: name,
        type: document.getElementById('paramType').value,
        unit: document.getElementById('paramUnit').value,
        description: document.getElementById('paramDescription').value.trim(),
        values: []
    };

    parameters.push(parameter);
    updateParameterList();
    this.reset();
    document.getElementById('paramType').dispatchEvent(new Event('change'));
});

// Generate combinations
function generateCombinations(arrays) {
    if (arrays.length === 0) return [[]];
    const [first, ...rest] = arrays;
    const combinations = generateCombinations(rest);
    return first.flatMap(x => combinations.map(c => [x, ...c]));
}

// Format CSV content
function formatCSV() {
    const headers = ['Description', ...parameters.map(p => `${p.name}##${p.type}##${p.unit}`)].join(',');
    const values = parameters.map(p => p.values);
    const combinations = generateCombinations(values);
    const rows = combinations.map((row, index) => [`Row_${index + 1}`, ...row].join(','));
    return [headers, ...rows].join('\n');
}

// Update parameter list UI
function updateParameterList() {
    const container = document.getElementById('parameterList');
    container.innerHTML = parameters.map(param => `
        <div class="parameter-item" data-id="${param.id}">
            <div class="parameter-header">
                <div>
                    <h3 class="parameter-title">${param.name}##${param.type}##${param.unit}</h3>
                    ${param.description ? `<p class="text-sm text-gray-500">Description: ${param.description}</p>` : ''}
                </div>
                <button class="delete-btn" onclick="removeParameter('${param.id}')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
            <div class="value-input">
                <form onsubmit="addValue(event, '${param.id}')" class="flex gap-2">
                    <input type="text" class="flex-1 px-3 py-1 border rounded" placeholder="Add value">
                    <button type="submit" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </button>
                </form>
            </div>
            <div class="value-list">
                ${param.values.map((value, index) => `
                    <span class="value-tag">
                        ${value}
                        <button onclick="removeValue('${param.id}', ${index})" class="text-gray-500 hover:text-red-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');

    updatePreview();
}

// Add value to parameter
function addValue(event, parameterId) {
    event.preventDefault();
    const input = event.target.querySelector('input');
    const value = input.value.trim();
    if (!value) return;

    const parameter = parameters.find(p => p.id === parameterId);
    if (parameter) {
        parameter.values.push(value);
        updateParameterList();
    }
    input.value = '';
}

// Remove value from parameter
function removeValue(parameterId, valueIndex) {
    const parameter = parameters.find(p => p.id === parameterId);
    if (parameter) {
        parameter.values.splice(valueIndex, 1);
        updateParameterList();
    }
}

// Remove parameter
function removeParameter(parameterId) {
    parameters = parameters.filter(p => p.id !== parameterId);
    updateParameterList();
}

// Update preview table
function updatePreview() {
    const previewSection = document.getElementById('previewSection');
    const previewTable = document.getElementById('previewTable');
    
    if (parameters.length === 0) {
        previewSection.classList.add('hidden');
        return;
    }

    previewSection.classList.remove('hidden');
    const values = parameters.map(p => p.values);
    const combinations = generateCombinations(values);

    previewTable.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-900">Description</th>
                    ${parameters.map(param => `
                        <th class="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                            ${param.name}##${param.type}##${param.unit}
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${combinations.map((combination, index) => `
                    <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                        <td class="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">Row_${index + 1}</td>
                        ${combination.map(value => `
                            <td class="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">${value}</td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Download CSV
document.getElementById('downloadBtn').addEventListener('click', function() {
    const csvContent = formatCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revit-lookup-table.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});