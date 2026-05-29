// --- DATABASE SIMULADA EM LOCALSTORAGE ---
const defaultHelpRequests = [
    {
        id: 1,
        name: "Maria do Carmo Santos",
        cpf: "123.456.789-01",
        phone: "(11) 98765-4321",
        address: "Rua das Amendoeiras, 45",
        suburb: "Bela Vista",
        income: "Até 1 Salário",
        familySize: 4,
        desc: "Necessito urgentemente de cesta básica. Estou desempregada com 3 crianças pequenas em idade escolar.",
        status: "Pendente",
        date: "20/05/2026"
    },
    {
        id: 2,
        name: "Antônio Ferreira",
        cpf: "234.567.890-12",
        phone: "(11) 97654-3210",
        address: "Av. do Estado, 1200",
        suburb: "Planalto",
        income: "Nenhuma renda",
        familySize: 2,
        desc: "Preciso de roupas de frio para meu neto recém-nascido e auxílio com fraldas descartáveis.",
        status: "Aprovado",
        date: "19/05/2026"
    },
    {
        id: 3,
        name: "Juliana Mendes Garcia",
        cpf: "345.678.901-23",
        phone: "(11) 91234-5678",
        address: "Rua do Bosque, 89",
        suburb: "Vila Nova",
        income: "De 1 a 2 Salários",
        familySize: 5,
        desc: "Gostaria de solicitar apoio de leite e fraldas para as minhas duas filhas menores.",
        status: "Atendido",
        date: "18/05/2026"
    }
];

// Inicialização segura do banco de dados no navegador
if (!localStorage.getItem('helpRequests')) {
    localStorage.setItem('helpRequests', JSON.stringify(defaultHelpRequests));
}

let activeDetailId = null;

// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
    highlightActiveMenu();
    setupHeaderScroll();
    setupMobileMenu();
    setupBackToTop();
    setupInputMasks();
    setupFormHandlers();
    
    // Se estiver na página do Admin, inicializa a tabela e estatísticas
    if (document.getElementById("admin-table-body")) {
        renderAdminTable();
        updateAdminStats();
        
        // Listeners para a barra de busca e filtros do admin
        document.getElementById('admin-search').addEventListener('input', renderAdminTable);
        document.getElementById('admin-filter').addEventListener('change', renderAdminTable);
    }
});

// --- DESTACAR BOTÃO ATIVO DO MENU ---
function highlightActiveMenu() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const href = btn.getAttribute('href');
        if (href === page || (page === "" && href === "index.html")) {
            btn.classList.add('text-gold-500', 'bg-white/5');
            btn.classList.remove('text-gray-300');
        } else {
            btn.classList.remove('text-gold-500', 'bg-white/5');
            btn.classList.add('text-gray-300');
        }
    });
}

// --- EFEITO DE SCROLL NO HEADER ---
function setupHeaderScroll() {
    const mainHeader = document.getElementById('main-header');
    if (!mainHeader) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('shadow-xl', 'bg-dark-pure/95');
        } else {
            mainHeader.classList.remove('shadow-xl', 'bg-dark-pure/95');
        }
    });
}

// --- CONTROLE DO MENU RESPONSIVO ---
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (!mobileMenuToggle || !mobileMenu) return;

    mobileMenuToggle.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        if (isHidden) {
            menuIcon.className = 'fa-solid fa-bars text-2xl';
        } else {
            menuIcon.className = 'fa-solid fa-xmark text-2xl';
        }
    });
}

// --- BOTÃO VOLTAR AO TOPO ---
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            backToTopBtn.classList.add('opacity-100');
        } else {
            backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            backToTopBtn.classList.remove('opacity-100');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- MÁSCARAS DE ENTRADA (MÁSCARAS DE FORMULÁRIO) ---
function setupInputMasks() {
    const phoneInputs = [document.getElementById('donation-phone'), document.getElementById('help-phone')];
    const cpfInput = document.getElementById('help-cpf');

    phoneInputs.forEach(input => {
        if (!input) return;
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 6) {
                e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            } else if (value.length > 2) {
                e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else if (value.length > 0) {
                e.target.value = `(${value}`;
            } else {
                e.target.value = "";
            }
        });
    });

    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 9) {
                e.target.value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
            } else if (value.length > 6) {
                e.target.value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
            } else if (value.length > 3) {
                e.target.value = `${value.slice(0, 3)}.${value.slice(3)}`;
            } else {
                e.target.value = value;
            }
        });
    }
}

// --- VALIDAÇÃO REAL DE CPF ---
function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '' || cpf.length !== 11) return false;
    
    // Elimina CPFs conhecidos inválidos
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Valida 1o dígito
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    
    // Valida 2o dígito
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// --- VALIDAR TELEFONE ---
function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11;
}

// --- GERENCIAMENTO E VALIDAÇÃO DOS FORMULÁRIOS ---
function setupFormHandlers() {
    // 1. Form de Doação
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('donation-name');
            const phoneInput = document.getElementById('donation-phone');
            const itemSelect = document.getElementById('donation-item');
            const quantityInput = document.getElementById('donation-quantity');

            let isValid = true;

            if (!nameInput.value.trim()) {
                showInputError('donation-name');
                isValid = false;
            } else {
                hideInputError('donation-name');
            }

            if (!isValidPhone(phoneInput.value)) {
                showInputError('donation-phone');
                isValid = false;
            } else {
                hideInputError('donation-phone');
            }

            if (!itemSelect.value) {
                showInputError('donation-item');
                isValid = false;
            } else {
                hideInputError('donation-item');
            }

            const qty = parseInt(quantityInput.value);
            if (isNaN(qty) || qty <= 0) {
                showInputError('donation-quantity');
                isValid = false;
            } else {
                hideInputError('donation-quantity');
            }

            if (isValid) {
                showSuccessModal(
                    "Doação Registrada!", 
                    `Olá ${nameInput.value}! Registramos sua intenção de doar ${qty}x ${itemSelect.value}. Nossa equipe de assistência entrará em contato via WhatsApp dentro de instantes.`
                );
                donationForm.reset();
            }
        });
    }

    // 2. Form de Solicitação de Ajuda
    const helpForm = document.getElementById('help-form');
    if (helpForm) {
        helpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('help-name');
            const cpfInput = document.getElementById('help-cpf');
            const phoneInput = document.getElementById('help-phone');
            const incomeSelect = document.getElementById('help-income');
            const addressInput = document.getElementById('help-address');
            const suburbInput = document.getElementById('help-suburb');
            const sizeInput = document.getElementById('help-family-size');
            const descInput = document.getElementById('help-desc');
            const lgpdCheckbox = document.getElementById('help-lgpd');

            let isValid = true;

            if (!nameInput.value.trim()) {
                showInputError('help-name');
                isValid = false;
            } else {
                hideInputError('help-name');
            }

            if (!isValidCPF(cpfInput.value)) {
                showInputError('help-cpf');
                isValid = false;
            } else {
                hideInputError('help-cpf');
            }

            if (!isValidPhone(phoneInput.value)) {
                showInputError('help-phone');
                isValid = false;
            } else {
                hideInputError('help-phone');
            }

            if (!incomeSelect.value) {
                showInputError('help-income');
                isValid = false;
            } else {
                hideInputError('help-income');
            }

            if (!addressInput.value.trim()) {
                showInputError('help-address');
                isValid = false;
            } else {
                hideInputError('help-address');
            }

            if (!suburbInput.value.trim()) {
                showInputError('help-suburb');
                isValid = false;
            } else {
                hideInputError('help-suburb');
            }

            const size = parseInt(sizeInput.value);
            if (isNaN(size) || size < 1) {
                showInputError('help-family-size');
                isValid = false;
            } else {
                hideInputError('help-family-size');
            }

            if (descInput.value.trim().length < 15) {
                showInputError('help-desc');
                isValid = false;
            } else {
                hideInputError('help-desc');
            }

            if (!lgpdCheckbox.checked) {
                document.getElementById('err-help-lgpd').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('err-help-lgpd').classList.add('hidden');
            }

            if (isValid) {
                const currentRequests = JSON.parse(localStorage.getItem('helpRequests')) || [];
                const newRequest = {
                    id: Date.now(),
                    name: nameInput.value.trim(),
                    cpf: cpfInput.value,
                    phone: phoneInput.value,
                    address: addressInput.value,
                    suburb: suburbInput.value,
                    income: incomeSelect.value,
                    familySize: size,
                    desc: descInput.value.trim(),
                    status: "Pendente",
                    date: new Date().toLocaleDateString('pt-BR')
                };
                currentRequests.unshift(newRequest);
                localStorage.setItem('helpRequests', JSON.stringify(currentRequests));

                showSuccessModal(
                    "Solicitação enviada com sucesso.",
                    "Seu pedido foi recebido confidencialmente por nossa liderança social e será analisado com total carinho. Entraremos em contato em breve."
                );
                
                helpForm.reset();
            }
        });
    }
}

// --- AUXILIARES DE FORMULÁRIO ---
function showInputError(id) {
    const errorEl = document.getElementById(`err-${id}`);
    const inputEl = document.getElementById(id);
    if (errorEl) errorEl.classList.remove('hidden');
    if (inputEl) inputEl.classList.add('border-red-500');
}

function hideInputError(id) {
    const errorEl = document.getElementById(`err-${id}`);
    const inputEl = document.getElementById(id);
    if (errorEl) errorEl.classList.add('hidden');
    if (inputEl) inputEl.classList.remove('border-red-500');
}

// --- MODAIS DE SUCESSO ---
function showSuccessModal(title, msg) {
    const modal = document.getElementById('modal-success');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    if (modal && modalTitle && modalMessage) {
        modalTitle.textContent = title;
        modalMessage.textContent = msg;
        modal.classList.remove('hidden');
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('modal-success');
    if (modal) modal.classList.add('hidden');
}

// --- OPERAÇÕES DO PAINEL ADMIN ---
function renderAdminTable() {
    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;

    const searchVal = document.getElementById('admin-search').value.toLowerCase();
    const filterVal = document.getElementById('admin-filter').value;
    const requests = JSON.parse(localStorage.getItem('helpRequests')) || [];

    // Filtros aplicados na busca e status
    const filtered = requests.filter(req => {
        const matchesSearch = req.name.toLowerCase().includes(searchVal) || req.suburb.toLowerCase().includes(searchVal);
        const matchesFilter = filterVal === "todos" || req.status === filterVal;
        return matchesSearch && matchesFilter;
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                    Nenhum registro encontrado correspondente aos critérios.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(req => {
        let badgeClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
        if (req.status === "Aprovado") badgeClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
        if (req.status === "Atendido") badgeClass = "bg-green-500/10 text-green-500 border-green-500/20";

        tableBody.innerHTML += `
            <tr class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4">
                    <div>
                        <p class="text-white font-semibold text-sm">${req.name}</p>
                        <p class="text-gray-500 text-xs mt-0.5">${req.date} • ${req.phone}</p>
                    </div>
                </td>
                <td class="px-6 py-4 text-gray-300 text-sm">${req.suburb}</td>
                <td class="px-6 py-4 text-gray-300 text-sm">${req.familySize} pessoas</td>
                <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}">
                        ${req.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="openDetailModal(${req.id})" class="px-3.5 py-1.5 bg-gold-500/10 text-gold-500 border border-gold-500/20 hover:bg-gold-500 hover:text-dark rounded-xl text-xs font-medium transition duration-150">
                        Visualizar
                    </button>
                </td>
            </tr>
        `;
    });
}

function updateAdminStats() {
    const requests = JSON.parse(localStorage.getItem('helpRequests')) || [];
    const pendingCount = requests.filter(r => r.status === "Pendente").length;
    
    const pendingEl = document.getElementById('stat-pending');
    if (pendingEl) pendingEl.textContent = pendingCount;
}

function openDetailModal(id) {
    activeDetailId = id;
    const requests = JSON.parse(localStorage.getItem('helpRequests')) || [];
    const req = requests.find(r => r.id === id);

    if (!req) return;

    const contentDiv = document.getElementById('detail-content');
    const btnApprove = document.getElementById('btn-approve-action');
    const modalDetail = document.getElementById('modal-detail');

    if (req.status !== "Pendente") {
        btnApprove.classList.add('hidden');
    } else {
        btnApprove.classList.remove('hidden');
    }

    contentDiv.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Beneficiário</p>
                <p class="text-white font-bold mt-1 text-base">${req.name}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">CPF</p>
                <p class="text-white font-mono mt-1">${req.cpf}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Telefone</p>
                <p class="text-gold-500 mt-1">${req.phone}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Membros da Família</p>
                <p class="text-white mt-1">${req.familySize} pessoas</p>
            </div>
            <div class="col-span-2">
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Endereço Completo</p>
                <p class="text-white mt-1">${req.address} — Bairro: ${req.suburb}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Renda Familiar</p>
                <p class="text-white mt-1">${req.income}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Status Atual</p>
                <p class="text-white mt-1">${req.status}</p>
            </div>
            <div class="col-span-2">
                <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Necessidades Descritas</p>
                <div class="bg-white/5 border border-white/5 rounded-2xl p-4 mt-2 text-gray-300 italic text-sm leading-relaxed">
                    "${req.desc}"
                </div>
            </div>
        </div>
    `;

    if (modalDetail) modalDetail.classList.remove('hidden');
}

function closeDetailModal() {
    const modalDetail = document.getElementById('modal-detail');
    if (modalDetail) modalDetail.classList.add('hidden');
    activeDetailId = null;
}

function approveRequestFromDetail() {
    if (!activeDetailId) return;

    const requests = JSON.parse(localStorage.getItem('helpRequests')) || [];
    const index = requests.findIndex(r => r.id === activeDetailId);

    if (index !== -1) {
        requests[index].status = "Aprovado";
        localStorage.setItem('helpRequests', JSON.stringify(requests));
        
        closeDetailModal();
        renderAdminTable();
        updateAdminStats();
        showSuccessModal("Pedido Aprovado", "A solicitação foi deferida com sucesso. O sistema disparou as notificações internas para separação de donativos.");
    }
}
function rejectRequest() {

    if (!activeDetailId) return;

    const motivo = prompt("Informe o motivo da reprovação:");

    if (!motivo) return;

    const requests =
        JSON.parse(localStorage.getItem("helpRequests")) || [];

    const index =
        requests.findIndex(r => r.id === activeDetailId);

    if (index !== -1) {

        requests[index].status = "Reprovado";
        requests[index].motivo = motivo;

        localStorage.setItem(
            "helpRequests",
            JSON.stringify(requests)
        );

        closeDetailModal();

        renderAdminTable();

        updateAdminStats();

        showSuccessModal(
            "Solicitação Reprovada",
            "A solicitação foi reprovada com sucesso."
        );
    }
}