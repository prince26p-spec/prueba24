// Configuración de Supabase
const supabaseUrl = 'https://fcckmkdgldgpypitcuko.supabase.co';
const supabaseKey = 'sb_publishable_E3O82jTp9UvqAVMLtP0S5w_1rzf7gB3';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- UTILIDADES ---
const getUrlParam = (param) => new URLSearchParams(window.location.search).get(param);

const showLoader = (show) => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.toggle('hidden', !show);
};

// --- LÓGICA DE VISUALIZACIÓN (index.html) ---
async function initVisualization() {
    const id = getUrlParam('id');
    const tipo = getUrlParam('tipo');

    if (!id || !tipo) {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            // Si estamos en index pero sin params, podríamos mostrar error o redirigir
            document.getElementById('error-view')?.classList.remove('hidden');
            showLoader(false);
        }
        return;
    }

    try {
        if (tipo === 'hola') {
            const { data, error } = await _supabase.from('mensajes').select('*').eq('id', id).single();
            if (error || !data) throw error;

            document.getElementById('msg-nombre').innerText = `¡Hola, ${data.nombre}!`;
            document.getElementById('msg-texto').innerText = data.mensaje;
            document.getElementById('mensaje-view').classList.remove('hidden');
        }
        else if (tipo === 'calendario') {
            const { data, error } = await _supabase.from('calendarios').select('*').eq('id', id).single();
            if (error || !data) throw error;

            document.getElementById('cal-nombre').innerText = `Calendario de ${data.nombre}`;
            document.getElementById('cal-nombre-footer').innerText = data.nombre;
            document.getElementById('cal-nombre-footer').style.color = data.color;

            renderCalendar(data.color);
            document.getElementById('calendario-view').classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
        document.getElementById('error-view').classList.remove('hidden');
    } finally {
        showLoader(false);
    }
}

function renderCalendar(accentColor) {
    const container = document.getElementById('calendar-days');
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

    // Ajuste para que lunes sea 0
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;

    // Espacios en blanco
    for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement('div');
        container.appendChild(empty);
    }

    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day hover:bg-white/10 cursor-default';
        dayEl.innerText = d;
        if (d === now.getDate()) {
            dayEl.style.backgroundColor = accentColor;
            dayEl.classList.add('font-bold', 'shadow-lg');
            dayEl.style.boxShadow = `0 0 15px ${accentColor}55`;
        }
        container.appendChild(dayEl);
    }
}

// --- LÓGICA DE ADMINISTRACIÓN (admin.html) ---
async function initAdmin() {
    if (!document.getElementById('admin-dashboard')) return;

    // Chequear sesión
    const { data: { session } } = await _supabase.auth.getSession();
    toggleAdminUI(!!session);

    // Eventos de Login
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) {
            const errEl = document.getElementById('login-error');
            errEl.innerText = "Error: " + error.message;
            errEl.classList.remove('hidden');
        } else {
            window.location.reload();
        }
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        await _supabase.auth.signOut();
        window.location.reload();
    });

    // Cambio de Tabs
    const tabHola = document.getElementById('tab-hola');
    const tabCal = document.getElementById('tab-calendario');
    const formHola = document.getElementById('form-hola');
    const formCal = document.getElementById('form-calendario');

    tabHola?.addEventListener('click', () => {
        tabHola.className = 'pb-2 px-2 tab-active font-semibold';
        tabCal.className = 'pb-2 px-2 text-slate-400 font-semibold';
        formHola.classList.remove('hidden');
        formCal.classList.add('hidden');
    });

    tabCal?.addEventListener('click', () => {
        tabCal.className = 'pb-2 px-2 tab-active font-semibold';
        tabHola.className = 'pb-2 px-2 text-slate-400 font-semibold';
        formCal.classList.remove('hidden');
        formHola.classList.add('hidden');
    });

    // Guardar Datos
    document.getElementById('save-hola')?.addEventListener('click', async () => {
        const nombre = document.getElementById('hola-nombre').value;
        const mensaje = document.getElementById('hola-mensaje').value;
        if (!nombre || !mensaje) return alert('Completa todos los campos');

        const { error } = await _supabase.from('mensajes').insert([{ nombre, mensaje }]);
        if (error) alert(error.message);
        else {
            alert('¡Mensaje creado!');
            location.reload();
        }
    });

    document.getElementById('save-calendario')?.addEventListener('click', async () => {
        const nombre = document.getElementById('cal-nombre-input').value;
        const color = document.getElementById('cal-color-input').value;
        if (!nombre) return alert('Ingresa un nombre');

        const { error } = await _supabase.from('calendarios').insert([{ nombre, color }]);
        if (error) alert(error.message);
        else {
            alert('¡Calendario creado!');
            location.reload();
        }
    });

    if (session) {
        loadTableData();
    }
}

function toggleAdminUI(isLoggedIn) {
    document.getElementById('login-section')?.classList.toggle('hidden', isLoggedIn);
    document.getElementById('admin-dashboard')?.classList.toggle('hidden', !isLoggedIn);
}

async function loadTableData() {
    const tableBody = document.getElementById('data-table-body');
    if (!tableBody) return;

    const { data: msgs } = await _supabase.from('mensajes').select('*').order('created_at', { ascending: false });
    const { data: cals } = await _supabase.from('calendarios').select('*').order('created_at', { ascending: false });

    tableBody.innerHTML = '';

    msgs?.forEach(item => addTableRow(tableBody, 'hola', item));
    cals?.forEach(item => addTableRow(tableBody, 'calendario', item));
}

function addTableRow(container, tipo, item) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-white/5 transition-colors';

    // Generate robust URLs handling both localhost, file://, and hosted paths
    // Remove query params and filename from current URL to get base dir
    const currentPath = window.location.href.split('?')[0];
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1); // e.g. "file:///.../"

    // Absolute URLs for copying/QR
    const indexFullUrl = basePath + 'index.html';
    const minigameFullUrl = basePath + 'minigame.html';

    // Links with IDs
    const finalHolaUrl = `${indexFullUrl}?id=${item.id}&tipo=${tipo}`;
    const finalGameUrl = `${minigameFullUrl}?id=${item.id}`;

    // Relative link for "Probar" button (Safest for local file navigation)
    const relativeGameUrl = `minigame.html?id=${item.id}`;

    tr.innerHTML = `
        <td class="p-4">
            <span class="px-2 py-1 rounded text-xs font-bold uppercase ${tipo === 'hola' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}">
                ${tipo === 'hola' ? 'Dedicatoria' : 'Calendario'}
            </span>
        </td>
        <td class="p-4 font-medium text-white/90">${item.nombre}</td>
        <td class="p-4">
            <div class="flex flex-wrap gap-2">
                <!-- Static Message Link -->
                <button onclick="copyToClipboard('${finalHolaUrl}')" 
                    title="Copiar Link Mensaje Estático"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs text-slate-300">
                    <span>📄</span> Mensaje
                </button>
                
                ${tipo === 'hola' ? `
                <!-- Game Link -->
                <button onclick="copyToClipboard('${finalGameUrl}')" 
                    title="Copiar Link Juego"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 transition-all text-xs text-pink-300 font-medium">
                    <span>🎮</span> Copiar Link
                </button>
                
                <!-- Preview Button -->
                <a href="${relativeGameUrl}" target="_blank"
                    title="Probar Juego"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors text-xs text-emerald-300">
                    <span>👁️</span> Jugar
                </a>
                ` : ''}

                <!-- QR -->
                <button onclick="generateQR('${tipo === 'hola' ? finalGameUrl : finalHolaUrl}')" 
                    title="Ver QR"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs text-slate-300">
                    <span>📱</span> QR
                </button>
            </div>
        </td>
    `;
    container.appendChild(tr);
}

// --- GLOBAL UTILS FOR BUTTONS ---
window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Enlace copiado al portapapeles');
    });
};

window.generateQR = (text) => {
    const modal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: text,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    modal.classList.remove('hidden');
};

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', () => {
    initVisualization();
    initAdmin();
});
