// Dados iniciais
        let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        let mapa;
        let geoJsonLayer;
        let graficoBarras, graficoPizza, graficoRosca, graficoPolar, graficoLinha, graficoArea;

        // Estados brasileiros
        const estados = [
            { sigla: 'AC', nome: 'Acre' },
            { sigla: 'AL', nome: 'Alagoas' },
            { sigla: 'AP', nome: 'Amapá' },
            { sigla: 'AM', nome: 'Amazonas' },
            { sigla: 'BA', nome: 'Bahia' },
            { sigla: 'CE', nome: 'Ceará' },
            { sigla: 'DF', nome: 'Distrito Federal' },
            { sigla: 'ES', nome: 'Espírito Santo' },
            { sigla: 'GO', nome: 'Goiás' },
            { sigla: 'MA', nome: 'Maranhão' },
            { sigla: 'MT', nome: 'Mato Grosso' },
            { sigla: 'MS', nome: 'Mato Grosso do Sul' },
            { sigla: 'MG', nome: 'Minas Gerais' },
            { sigla: 'PA', nome: 'Pará' },
            { sigla: 'PB', nome: 'Paraíba' },
            { sigla: 'PR', nome: 'Paraná' },
            { sigla: 'PE', nome: 'Pernambuco' },
            { sigla: 'PI', nome: 'Piauí' },
            { sigla: 'RJ', nome: 'Rio de Janeiro' },
            { sigla: 'RN', nome: 'Rio Grande do Norte' },
            { sigla: 'RS', nome: 'Rio Grande do Sul' },
            { sigla: 'RO', nome: 'Rondônia' },
            { sigla: 'RR', nome: 'Roraima' },
            { sigla: 'SC', nome: 'Santa Catarina' },
            { sigla: 'SP', nome: 'São Paulo' },
            { sigla: 'SE', nome: 'Sergipe' },
            { sigla: 'TO', nome: 'Tocantins' }
        ];

        // Inicialização
        document.addEventListener('DOMContentLoaded', function() {
            preencherEstados();
            inicializarMapa();
            configurarTabs();
            carregarGeoJSON().then(() => {
                atualizarTabela();
                atualizarMapa();
                atualizarTodosGraficos();
                atualizarResumo();
            });
            configurarFormulario();
            
            // Definir data padrão para hoje
            document.getElementById('data').valueAsDate = new Date();
        });

        // Configurar abas
        function configurarTabs() {
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remover classe active de todas as tabs e conteúdos
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Adicionar classe active à tab clicada e ao conteúdo correspondente
                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
        }

        // Carregar GeoJSON do Brasil
        async function carregarGeoJSON() {
            // GeoJSON simplificado do Brasil
            const brasilGeoJSON = {
                "type": "FeatureCollection",
                "features": estados.map(estado => ({
                    "type": "Feature",
                    "properties": {
                        "sigla": estado.sigla,
                        "nome": estado.nome
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [gerarCoordenadasAleatorias(estado.sigla)]
                    }
                }))
            };
            return brasilGeoJSON;
        }

        // Função auxiliar para gerar coordenadas fictícias (em um projeto real, use um GeoJSON completo)
        function gerarCoordenadasAleatorias(sigla) {
            // Coordenadas aproximadas para cada estado (simplificado)
            const centroides = {
                'AC': [-8.77, -70.55], 'AL': [-9.71, -35.73], 'AP': [1.41, -51.77],
                'AM': [-3.47, -65.10], 'BA': [-12.96, -38.51], 'CE': [-3.71, -38.54],
                'DF': [-15.78, -47.93], 'ES': [-19.19, -40.34], 'GO': [-16.64, -49.31],
                'MA': [-2.55, -44.30], 'MT': [-12.64, -55.42], 'MS': [-20.51, -54.54],
                'MG': [-18.10, -44.38], 'PA': [-5.53, -52.29], 'PB': [-7.06, -35.55],
                'PR': [-24.89, -51.55], 'PE': [-8.28, -35.07], 'PI': [-8.28, -43.68],
                'RJ': [-22.25, -42.66], 'RN': [-5.81, -36.59], 'RS': [-30.01, -51.22],
                'RO': [-11.22, -62.80], 'RR': [1.99, -61.33], 'SC': [-27.45, -50.95],
                'SP': [-22.19, -48.79], 'SE': [-10.57, -37.45], 'TO': [-10.25, -48.25]
            };

            const [lat, lng] = centroides[sigla];
            const variacao = 2; // Graus de variação para criar um polígono simples
            
            return [
                [lng - variacao, lat - variacao],
                [lng + variacao, lat - variacao],
                [lng + variacao, lat + variacao],
                [lng - variacao, lat + variacao],
                [lng - variacao, lat - variacao]
            ];
        }

        // Preencher dropdown de estados
        function preencherEstados() {
            const selectEstado = document.getElementById('estado');
            estados.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.sigla;
                option.textContent = estado.nome;
                selectEstado.appendChild(option);
            });
        }

        // Configurar formulário
        function configurarFormulario() {
            const form = document.getElementById('gastoForm');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const estado = document.getElementById('estado').value;
                const valor = parseFloat(document.getElementById('valor').value);
                const categoria = document.getElementById('categoria').value;
                const data = document.getElementById('data').value;
                
                const novoGasto = {
                    id: Date.now(),
                    estado,
                    valor,
                    categoria,
                    data
                };
                
                gastos.push(novoGasto);
                salvarDados();
                atualizarTabela();
                atualizarMapa();
                atualizarTodosGraficos();
                atualizarResumo();
                
                // Feedback visual
                const button = form.querySelector('button');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Registrado!';
                button.style.background = 'linear-gradient(135deg, var(--success-color), #27ae60)';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                    form.reset();
                    document.getElementById('data').valueAsDate = new Date();
                }, 1500);
            });
        }

        // Salvar dados no localStorage
        function salvarDados() {
            localStorage.setItem('gastos', JSON.stringify(gastos));
        }

        // Atualizar tabela
        function atualizarTabela() {
            const tbody = document.querySelector('#tabelaGastos tbody');
            tbody.innerHTML = '';
            
            if (gastos.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="5" style="text-align: center;">Nenhum gasto registrado</td>';
                tbody.appendChild(tr);
                return;
            }
            
            // Ordenar por data (mais recente primeiro)
            const gastosOrdenados = [...gastos].sort((a, b) => new Date(b.data) - new Date(a.data));
            
            gastosOrdenados.forEach(gasto => {
                const tr = document.createElement('tr');
                const estadoNome = estados.find(e => e.sigla === gasto.estado)?.nome || gasto.estado;
                
                tr.innerHTML = `
                    <td>${estadoNome}</td>
                    <td>R$ ${formatarValor(gasto.valor)}</td>
                    <td>${gasto.categoria}</td>
                    <td>${new Date(gasto.data).toLocaleDateString('pt-BR')}</td>
                    <td>
                        <button class="btn-excluir" data-id="${gasto.id}"><i class="fas fa-trash-alt"></i> Excluir</button>
                    </td>
                `;
                
                tbody.appendChild(tr);
            });
            
            // Configurar eventos de exclusão
            document.querySelectorAll('.btn-excluir').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    gastos = gastos.filter(g => g.id !== id);
                    salvarDados();
                    atualizarTabela();
                    atualizarMapa();
                    atualizarTodosGraficos();
                    atualizarResumo();
                });
            });
        }

        function formatarValor(valor) {
            return valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
        }

        // Mapa do Brasil
        function inicializarMapa() {
            mapa = L.map('mapa').setView([-15, -55], 4);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapa);
        }

        async function atualizarMapa() {
            const geojsonData = await carregarGeoJSON();
            
            // Remove a camada anterior se existir
            if (geoJsonLayer) {
                mapa.removeLayer(geoJsonLayer);
            }
            
            // Calcula totais por estado
            const gastosPorEstado = calcularTotaisPorEstado();
            
            // Adiciona nova camada com interatividade
            geoJsonLayer = L.geoJSON(geojsonData, {
                style: function(feature) {
                    const sigla = feature.properties.sigla;
                    const total = gastosPorEstado[sigla] || 0;
                    
                    return {
                        fillColor: getCorPorValor(total),
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: function(feature, layer) {
                    const sigla = feature.properties.sigla;
                    const nome = feature.properties.nome;
                    const total = gastosPorEstado[sigla] || 0;
                    
                    // Tooltip dinâmico
                    layer.bindTooltip(`<b>${nome}</b><br>Total: R$ ${formatarValor(total)}`, {
                        permanent: false,
                        direction: 'auto'
                    });
                    
                    // Popup com detalhes
                    layer.bindPopup(criarPopupContent(sigla, nome));
                    
                    // Efeitos de hover
                    layer.on({
                        mouseover: function(e) {
                            const layer = e.target;
                            layer.setStyle({
                                weight: 3,
                                color: '#666',
                                fillOpacity: 0.9
                            });
                            layer.bringToFront();
                        },
                        mouseout: function(e) {
                            geoJsonLayer.resetStyle(e.target);
                        },
                        click: function(e) {
                            mapa.fitBounds(e.target.getBounds());
                        }
                    });
                }
            }).addTo(mapa);
        }

        function criarPopupContent(sigla, nome) {
            const gastosEstado = gastos.filter(g => g.estado === sigla);
            let content = `<h3>${nome}</h3>`;
            
            if (gastosEstado.length === 0) {
                content += '<p>Nenhum gasto registrado</p>';
            } else {
                // Agrupar por categoria
                const gastosPorCategoria = {};
                gastosEstado.forEach(gasto => {
                    if (!gastosPorCategoria[gasto.categoria]) {
                        gastosPorCategoria[gasto.categoria] = 0;
                    }
                    gastosPorCategoria[gasto.categoria] += gasto.valor;
                });
                
                const total = gastosEstado.reduce((sum, g) => sum + g.valor, 0);
                content += `<p><strong>Total:</strong> R$ ${formatarValor(total)}</p>`;
                
                content += '<h4>Gastos por Categoria</h4>';
                content += '<table class="popup-table"><tr><th>Categoria</th><th>Valor</th></tr>';
                
                for (const [categoria, valor] of Object.entries(gastosPorCategoria)) {
                    content += `<tr>
                        <td>${categoria}</td>
                        <td>R$ ${formatarValor(valor)}</td>
                    </tr>`;
                }
                
                content += '</table>';
            }
            
            return content;
        }

        function calcularTotaisPorEstado() {
            const gastosPorEstado = {};
            
            // Inicializa todos os estados com 0
            estados.forEach(estado => {
                gastosPorEstado[estado.sigla] = 0;
            });
            
            // Soma os valores
            gastos.forEach(gasto => {
                if (gastosPorEstado.hasOwnProperty(gasto.estado)) {
                    gastosPorEstado[gasto.estado] += gasto.valor;
                }
            });
            
            return gastosPorEstado;
        }

        function getCorPorValor(valor) {
            return valor === 0 ? '#CCCCCC' :
                   valor > 1000000 ? '#800026' :
                   valor > 500000  ? '#BD0026' :
                   valor > 100000  ? '#E31A1C' :
                   valor > 50000   ? '#FC4E2A' :
                   valor > 10000   ? '#FD8D3C' :
                                     '#FFEDA0';
        }

        // Atualizar todos os gráficos
        function atualizarTodosGraficos() {
            atualizarGraficoBarras();
            atualizarGraficoPizza();
            atualizarGraficoRosca();
            atualizarGraficoPolar();
            atualizarGraficoLinha();
            atualizarGraficoArea();
        }

        // Gráfico de Barras
        function atualizarGraficoBarras() {
            const ctx = document.getElementById('graficoBarras').getContext('2d');
            
            // Agrupar gastos por estado e categoria
            const gastosPorEstadoCategoria = {};
            
            estados.forEach(estado => {
                gastosPorEstadoCategoria[estado.sigla] = {
                    'Salário': 0,
                    'Vale Alimentação': 0,
                    'Vale Transporte': 0,
                    'Férias': 0,
                    'Outros': 0,
                    total: 0
                };
            });
            
            gastos.forEach(gasto => {
                const estado = gasto.estado;
                const categoria = gasto.categoria;
                
                if (gastosPorEstadoCategoria[estado]) {
                    if (gastosPorEstadoCategoria[estado][categoria] !== undefined) {
                        gastosPorEstadoCategoria[estado][categoria] += gasto.valor;
                    } else {
                        gastosPorEstadoCategoria[estado]['Outros'] += gasto.valor;
                    }
                    gastosPorEstadoCategoria[estado].total += gasto.valor;
                }
            });
            
            // Filtrar apenas estados com gastos
            const estadosComGastos = estados.filter(estado => 
                gastosPorEstadoCategoria[estado.sigla].total > 0
            );
            
            const labels = estadosComGastos.map(estado => estado.nome);
            
            // Preparar datasets para cada categoria
            const categorias = ['Salário', 'Vale Alimentação', 'Vale Transporte', 'Férias', 'Outros'];
            const cores = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6'];
            
            const datasets = categorias.map((categoria, index) => {
                return {
                    label: categoria,
                    data: estadosComGastos.map(estado => 
                        gastosPorEstadoCategoria[estado.sigla][categoria]
                    ),
                    backgroundColor: cores[index],
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                };
            });
            
            // Adicionar dataset para o total
            datasets.push({
                label: 'Total',
                data: estadosComGastos.map(estado => 
                    gastosPorEstadoCategoria[estado.sigla].total
                ),
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderColor: '#2c3e50',
                borderWidth: 2,
                type: 'line',
                fill: false
            });
            
            // Destruir gráfico anterior se existir
            if (graficoBarras) {
                graficoBarras.destroy();
            }
            
            graficoBarras = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + formatarValor(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: R$ ${formatarValor(value)}`;
                                }
                            }
                        },
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }

        // Gráfico de Pizza
        function atualizarGraficoPizza() {
            const ctx = document.getElementById('graficoPizza').getContext('2d');
            
            // Agrupar gastos por categoria
            const gastosPorCategoria = {
                'Salário': 0,
                'Vale Alimentação': 0,
                'Vale Transporte': 0,
                'Férias': 0,
                'Outros': 0
            };
            
            gastos.forEach(gasto => {
                if (gastosPorCategoria.hasOwnProperty(gasto.categoria)) {
                    gastosPorCategoria[gasto.categoria] += gasto.valor;
                } else {
                    gastosPorCategoria['Outros'] += gasto.valor;
                }
            });
            
            const labels = Object.keys(gastosPorCategoria);
            const dados = Object.values(gastosPorCategoria);
            const cores = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6'];
            
            // Destruir gráfico anterior se existir
            if (graficoPizza) {
                graficoPizza.destroy();
            }
            
            graficoPizza = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dados,
                        backgroundColor: cores,
                        borderColor: '#fff',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: R$ ${formatarValor(value)} (${percentage}%)`;
                                }
                            }
                        },
                        legend: {
                            position: 'bottom',
                        },
                        datalabels: {
                            display: false
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
        }

        // Gráfico de Rosca
        function atualizarGraficoRosca() {
            const ctx = document.getElementById('graficoRosca').getContext('2d');
            
            // Agrupar gastos por estado
            const gastosPorEstado = calcularTotaisPorEstado();
            
            // Filtrar apenas estados com gastos
            const estadosComGastos = estados.filter(estado => 
                gastosPorEstado[estado.sigla] > 0
            );
            
            const labels = estadosComGastos.map(estado => estado.nome);
            const dados = estadosComGastos.map(estado => gastosPorEstado[estado.sigla]);
            
            // Gerar cores dinamicamente
            const cores = estadosComGastos.map((_, index) => {
                const hue = (index * 137.508) % 360; // Distribuição uniforme de cores
                return `hsl(${hue}, 70%, 60%)`;
            });
            
            // Destruir gráfico anterior se existir
            if (graficoRosca) {
                graficoRosca.destroy();
            }
            
            graficoRosca = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dados,
                        backgroundColor: cores,
                        borderColor: '#fff',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: R$ ${formatarValor(value)} (${percentage}%)`;
                                }
                            }
                        },
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }

        // Gráfico Polar
        function atualizarGraficoPolar() {
            const ctx = document.getElementById('graficoPolar').getContext('2d');
            
            // Agrupar gastos por categoria
            const gastosPorCategoria = {
                'Salário': 0,
                'Vale Alimentação': 0,
                'Vale Transporte': 0,
                'Férias': 0,
                'Outros': 0
            };
            
            gastos.forEach(gasto => {
                if (gastosPorCategoria.hasOwnProperty(gasto.categoria)) {
                    gastosPorCategoria[gasto.categoria] += gasto.valor;
                } else {
                    gastosPorCategoria['Outros'] += gasto.valor;
                }
            });
            
            const labels = Object.keys(gastosPorCategoria);
            const dados = Object.values(gastosPorCategoria);
            const cores = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6'];
            
            // Destruir gráfico anterior se existir
            if (graficoPolar) {
                graficoPolar.destroy();
            }
            
            graficoPolar = new Chart(ctx, {
                type: 'polarArea',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dados,
                        backgroundColor: cores,
                        borderColor: '#fff',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: R$ ${formatarValor(value)} (${percentage}%)`;
                                }
                            }
                        },
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }

        // Gráfico de Linha (temporal)
        function atualizarGraficoLinha() {
            const ctx = document.getElementById('graficoLinha').getContext('2d');
            
            // Agrupar gastos por mês e categoria
            const gastosPorMesCategoria = {};
            const meses = [];
            
            // Inicializar estrutura
            gastos.forEach(gasto => {
                const date = new Date(gasto.data);
                const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!meses.includes(mesAno)) {
                    meses.push(mesAno);
                }
                
                if (!gastosPorMesCategoria[mesAno]) {
                    gastosPorMesCategoria[mesAno] = {
                        'Salário': 0,
                        'Vale Alimentação': 0,
                        'Vale Transporte': 0,
                        'Férias': 0,
                        'Outros': 0
                    };
                }
                
                if (gastosPorMesCategoria[mesAno].hasOwnProperty(gasto.categoria)) {
                    gastosPorMesCategoria[mesAno][gasto.categoria] += gasto.valor;
                } else {
                    gastosPorMesCategoria[mesAno]['Outros'] += gasto.valor;
                }
            });
            
            // Ordenar meses
            meses.sort();
            
            // Preparar datasets para cada categoria
            const categorias = ['Salário', 'Vale Alimentação', 'Vale Transporte', 'Férias', 'Outros'];
            const cores = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6'];
            
            const datasets = categorias.map((categoria, index) => {
                return {
                    label: categoria,
                    data: meses.map(mes => gastosPorMesCategoria[mes][categoria]),
                    borderColor: cores[index],
                    backgroundColor: cores[index] + '20',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                };
            });
            
            // Formatando labels para exibição (MM/AAAA)
            const labelsFormatados = meses.map(mes => {
                const [ano, mesNum] = mes.split('-');
                return `${mesNum}/${ano}`;
            });
            
            // Destruir gráfico anterior se existir
            if (graficoLinha) {
                graficoLinha.destroy();
            }
            
            graficoLinha = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labelsFormatados,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + formatarValor(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: R$ ${formatarValor(value)}`;
                                }
                            }
                        },
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }

        // Gráfico de Área (temporal)
        function atualizarGraficoArea() {
            const ctx = document.getElementById('graficoArea').getContext('2d');
            
            // Agrupar gastos por mês
            const gastosPorMes = {};
            const meses = [];
            
            // Inicializar estrutura
            gastos.forEach(gasto => {
                const date = new Date(gasto.data);
                const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!meses.includes(mesAno)) {
                    meses.push(mesAno);
                }
                
                if (!gastosPorMes[mesAno]) {
                    gastosPorMes[mesAno] = 0;
                }
                
                gastosPorMes[mesAno] += gasto.valor;
            });
            
            // Ordenar meses
            meses.sort();
            
            // Preparar dataset
            const dados = meses.map(mes => gastosPorMes[mes]);
            
            // Formatando labels para exibição (MM/AAAA)
            const labelsFormatados = meses.map(mes => {
                const [ano, mesNum] = mes.split('-');
                return `${mesNum}/${ano}`;
            });
            
            // Destruir gráfico anterior se existir
            if (graficoArea) {
                graficoArea.destroy();
            }
            
            graficoArea = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labelsFormatados,
                    datasets: [{
                        label: 'Total de Gastos',
                        data: dados,
                        borderColor: '#3498db',
                        backgroundColor: '#3498db40',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R$ ' + formatarValor(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: R$ ${formatarValor(value)}`;
                                }
                            }
                        },
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }

        // Atualizar resumo
        function atualizarResumo() {
            if (gastos.length === 0) {
                document.getElementById('totalGasto').textContent = 'R$ 0,00';
                document.getElementById('maiorGasto').textContent = '-';
                document.getElementById('categoriaPrincipal').textContent = '-';
                document.getElementById('periodo').textContent = '-';
                return;
            }
            
            // Total gasto
            const total = gastos.reduce((sum, g) => sum + g.valor, 0);
            document.getElementById('totalGasto').textContent = 'R$ ' + formatarValor(total);
            
            // Estado com maior gasto
            const gastosPorEstado = calcularTotaisPorEstado();
            let maiorEstado = null;
            let maiorValor = 0;
            
            for (const [sigla, valor] of Object.entries(gastosPorEstado)) {
                if (valor > maiorValor) {
                    maiorValor = valor;
                    maiorEstado = estados.find(e => e.sigla === sigla)?.nome || sigla;
                }
            }
            
            document.getElementById('maiorGasto').textContent = `${maiorEstado} (R$ ${formatarValor(maiorValor)})`;
            
            // Categoria principal
            const gastosPorCategoria = {
                'Salário': 0,
                'Vale Alimentação': 0,
                'Vale Transporte': 0,
                'Férias': 0,
                'Outros': 0
            };
            
            gastos.forEach(gasto => {
                if (gastosPorCategoria.hasOwnProperty(gasto.categoria)) {
                    gastosPorCategoria[gasto.categoria] += gasto.valor;
                } else {
                    gastosPorCategoria['Outros'] += gasto.valor;
                }
            });
            
            let categoriaPrincipal = '';
            let maiorCategoriaValor = 0;
            
            for (const [categoria, valor] of Object.entries(gastosPorCategoria)) {
                if (valor > maiorCategoriaValor) {
                    maiorCategoriaValor = valor;
                    categoriaPrincipal = categoria;
                }
            }
            
            document.getElementById('categoriaPrincipal').textContent = `${categoriaPrincipal} (R$ ${formatarValor(maiorCategoriaValor)})`;
            
            // Período
            const datas = gastos.map(g => new Date(g.data));
            const dataMin = new Date(Math.min(...datas));
            const dataMax = new Date(Math.max(...datas));
            
            const formatoData = { month: 'long', year: 'numeric' };
            const dataMinStr = dataMin.toLocaleDateString('pt-BR', formatoData);
            const dataMaxStr = dataMax.toLocaleDateString('pt-BR', formatoData);
            
            document.getElementById('periodo').textContent = `${dataMinStr} - ${dataMaxStr}`;
        }