// Galaxia de girasoles. Personaliza textoAnillo, mensajesBonitos y mensajesImagen.
let escena, camara, renderizador, girasol, controles, fuente;
let lluviaGirasolesActiva = false, contadorToques = 0;
let objetosMensaje = [];
let objetosTextoAnillo = [];
let audioHabilitado = false;
let audioReproducido = false;
let sistemaParticulas = null;
let particulas = [];
let imagenCentro = null;
let puntosGirasol = null;
let tituloPrimavera = null;
let eraVertical = null;
let ultimoFrame = performance.now();
const girasolesCayendo = [];
// Detecta móviles y tablets (incluye iPad, que se anuncia como Mac con pantalla táctil).
const ES_MOVIL = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 1100);

const cargadorTexturas = new THREE.TextureLoader();
const cargadorFuentes = new THREE.FontLoader();

const textoAnillo = "QUE TUS DÍAS FLOREZCAN CON ALEGRÍA Y NUEVOS SUEÑOS   ";

const mensajesBonitos = [
  "SONRÍE",
  "BRILLA A TU RITMO",
  "SIGUE TUS SUEÑOS",
  "DISFRUTA EL CAMINO",
  "CONFÍA EN TI",
  "UN DÍA A LA VEZ",
  "ERES CAPAZ",
  "TODO FLORECE",
  "QUE NUNCA FALTE LUZ",
  "CREE EN TUS IDEAS",
  "CELEBRA TUS LOGROS",
  "RESPIRA Y CONTINÚA",
  "BUSCA LO BONITO",
  "FELIZ PRIMAVERA",
  "SIGUE CRECIENDO",
  "MERECES TRANQUILIDAD",
  "CUIDA TU ALEGRÍA",
  "PEQUEÑOS PASOS",
  "NUEVOS COMIENZOS",
  "TIENES MUCHO QUE DAR",
  "HAZ ESPACIO PARA SOÑAR",
  "DISFRUTA LAS COSAS SIMPLES",
  "HOY PUEDE SER BONITO",
  "TU ESFUERZO CUENTA",
  "TU SONRISA SUMA LUZ",
  "MERECES DÍAS BONITOS",
  "QUE FLOREZCA TU ALEGRÍA",
  "TIENES UNA LUZ ESPECIAL",
  "QUE HOY TE SORPRENDA",
  "CADA PASO VALE",
  "UN RESPIRO TAMBIÉN CUENTA",
  "SIGUE SIENDO TÚ",
  "ERES MÁS QUE TUS NOTAS",
  "DESCANSA SIN CULPA",
  "CUIDA LO QUE TE HACE BIEN",
  "HAY BELLEZA EN LO SIMPLE",
  "TU CURIOSIDAD ABRE CAMINOS",
  "APRENDE SIN PRISA",
  "QUÉ BONITO VERTE SONREÍR",
  "GUARDA MOMENTOS FELICES",
  "TUS IDEAS MERECEN ESPACIO",
  "DISFRUTA TU PROCESO",
  "CADA DÍA TRAE ALGO NUEVO",
  "NO OLVIDES DIVERTIRTE",
  "TU DEDICACIÓN SE NOTA",
  "FLORECE A TU MANERA",
  "RODÉATE DE COSAS BUENAS",
  "REGÁLATE UN MOMENTO DE PAZ",
  "QUE LA VIDA TE SONRÍA",
  "PASITO A PASITO",
  "SIGUE TU CURIOSIDAD",
  "ERES ÚNICA",
  "CELEBRA QUIÉN ERES",
  "LA PRIMAVERA TE SALUDA",
  "HAZ LO QUE TE ILUSIONA",
  "QUE ABUNDEN LAS RISAS",
  "TUS SUEÑOS IMPORTAN",
  "HAY MUCHO POR DESCUBRIR",
  "QUE NUNCA FALTEN FLORES",
  "QUE HOY SEA UN BUEN DÍA"
];

const mensajesImagen = [
  "Que esta primavera te regale motivos para sonreír.",
  "Cada pequeño paso también te acerca a tus sueños.",
  "Ojalá encuentres algo bonito en los días más sencillos.",
  "Florece a tu ritmo; disfruta todo lo que vas descubriendo."
];

const mensajesDelDia = [
  "Que hoy te pase algo bonito, aunque sea pequeñito.",
  "Tu esfuerzo merece reconocimiento, incluso cuando nadie lo ve.",
  "No necesitas tener todo resuelto para disfrutar el presente.",
  "Que encuentres tiempo para tus sueños y también para descansar.",
  "Ojalá esta pequeña galaxia te saque una sonrisa.",
  "Sigue aprendiendo: cada descubrimiento abre una nueva puerta.",
  "Lo que te hace diferente también te hace especial.",
  "Hay días para avanzar y días para recuperar fuerzas. Ambos cuentan.",
  "Que esta primavera venga llena de buenos momentos.",
  "Tu alegría también merece un lugar entre tus planes.",
  "Disfruta las pequeñas cosas que hacen grande un día.",
  "Que nunca te falten curiosidad, tranquilidad y motivos para sonreír.",
  "Cada pequeño logro tiene su propia historia. Celébralo.",
  "Que tus días tengan la calidez de un rayito de sol.",
  "Sigue creciendo a tu ritmo, como las flores.",
  "Hoy también puedes empezar algo que te ilusione."
];

// MP3 incluido en esta carpeta. Respeta la M mayúscula del nombre.
// Para cambiar la canción, sustituye Musica.mp3 por otro archivo de audio.
const NUEVA_CANCION = "Musica.mp3";
const audioPagina = document.getElementById("audio-fondo");
audioPagina.src = NUEVA_CANCION;
audioPagina.volume = 0.45;

function crearEstrellasCSS(cantidad) {
    const cielo = document.getElementById('cielo-estrellas');
    for (let i = 0; i < cantidad; i++) {
        const estrella = document.createElement('div');
        estrella.classList.add('estrella');
        const tamaño = Math.random() * 2 + 1;
        estrella.style.width = tamaño + 'px';
        estrella.style.height = tamaño + 'px';
        estrella.style.left = Math.random() * 100 + '%';
        estrella.style.top = Math.random() * 100 + '%';
        estrella.style.setProperty('--retraso', Math.random() * 5 + 's');
        estrella.style.setProperty('--duracion', (Math.random() * 4 + 2) + 's');
        cielo.appendChild(estrella);
    }
}

function cargarRecursos() {
    // La fuente viene incluida como script (lib/fuente-gentilis.js): funciona también sin servidor.
    if (window.FUENTE_GENTILIS) {
        fuente = new THREE.Font(window.FUENTE_GENTILIS);
        return Promise.resolve();
    }
    return Promise.race([new Promise(r => setTimeout(r, 10000)), Promise.all([
        new Promise((resolver) => {
            cargadorFuentes.load(
                'lib/gentilis_regular.typeface.json',
                (fuenteCargada) => {
                    fuente = fuenteCargada;
                    resolver();
                },
                undefined,
                (error) => {
                    console.error('Error cargando la fuente:', error);
                    resolver();
                }
            );
        })
    ])]);
}

function simularCarga() {
    const textoProgreso = document.getElementById('texto-progreso');
    let progreso = 0;

    const intervalo = setInterval(() => {
        progreso += 1;
        if (progreso <= 100) {
            textoProgreso.textContent = progreso + '%';
        } else {
            clearInterval(intervalo);
            animacionFinalCarga();
        }
    }, 30);
}

function animacionFinalCarga() {
    const textoProgreso = document.getElementById('texto-progreso');

    textoProgreso.textContent = '¡Lista una galaxia para alegrarte el día!';
    textoProgreso.style.color = '#ffcf40';
    textoProgreso.style.fontSize = '20px';

    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            crearGirasolExplosion();
        }, i * 100);
    }

    setTimeout(() => {
        document.getElementById('cargando').style.display = 'none';
        try { inicializarEscena(); } catch (err) { console.error(err); mostrarErrorWebGL(); }
    }, 1500);
}

function mostrarErrorWebGL() {
    document.getElementById('cargando').style.display = 'flex';
    document.querySelector('#cargando h2').textContent = 'No se pudo mostrar la galaxia';
    document.getElementById('puntos-cargando').style.display = 'none';
    const t = document.getElementById('texto-progreso');
    t.style.fontSize = '16px';
    t.textContent = 'Tu navegador no permite gráficos 3D (WebGL). Prueba abrirlo en Chrome o Safari.';
}

function crearGirasolExplosion() {
    const girasol = document.createElement('div');
    girasol.innerHTML = '🌻';
    girasol.style.position = 'absolute';
    girasol.style.fontSize = (Math.random() * 20 + 15) + 'px';
    girasol.style.left = Math.random() * 100 + 'vw';
    girasol.style.top = Math.random() * 100 + 'vh';
    girasol.style.color = '#ffd54f';
    girasol.style.textShadow = '0 0 10px #ffcf40';
    girasol.style.zIndex = '101';
    girasol.style.pointerEvents = 'none';
    girasol.style.animation = `explosionGirasol 1.5s ease-out forwards`;

    document.getElementById('cargando').appendChild(girasol);

    setTimeout(() => {
        if (girasol.parentNode) girasol.parentNode.removeChild(girasol);
    }, 1500);
}



function inicializarEscena() {
    escena = new THREE.Scene();
    escena.background = null;

    camara = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camara.position.set(0, 8, 30);

    const contenedor = document.getElementById('contenedor-escena');
    renderizador = new THREE.WebGLRenderer({
        antialias: (window.devicePixelRatio || 1) < 2,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, ES_MOVIL ? 1.75 : 2));
    renderizador.setSize(contenedor.clientWidth, contenedor.clientHeight);
    renderizador.toneMapping = THREE.ACESFilmicToneMapping;
    renderizador.toneMappingExposure = 1.2;
    renderizador.setClearColor(0x000000, 0);

    contenedor.appendChild(renderizador.domElement);

    controles = new THREE.OrbitControls(camara, renderizador.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.05;
    controles.rotateSpeed = 0.5;
    controles.enableZoom = true;
    controles.autoRotate = true;
    controles.autoRotateSpeed = 0.2;
    controles.minDistance = 15;
    controles.maxDistance = 50;
    controles.enablePan = false;


    const luzAmbiental = new THREE.AmbientLight(0x444477, 0.4);
    escena.add(luzAmbiental);

    const luzDireccional = new THREE.DirectionalLight(0xffffff, 1.5);
    luzDireccional.position.set(10, 10, 5);
    escena.add(luzDireccional);

    const luzPunto = new THREE.PointLight(0xffd54f, 0.8, 50);
    luzPunto.position.set(0, 0, 10);
    escena.add(luzPunto);

    const luzTrasera = new THREE.DirectionalLight(0x4466aa, 0.6);
    luzTrasera.position.set(-5, -5, -5);
    escena.add(luzTrasera);

    crearTituloPrimavera();
    crearGirasolConPuntos();
    crearAnilloTexto();
    crearCampoEstrellas();
    crearMensajesBonitos();
    crearPalabrasExtra();
    crearParticulasFlotantes();

    aplicarEncuadre(true);
    configurarEventos();

    animar();
}

function crearTituloPrimavera() {
    if (fuente) {
        const geometriaTexto = new THREE.TextGeometry("FELIZ PRIMAVERA", {
            font: fuente,
            size: 1.15,
            height: 0.5,
            curveSegments: ES_MOVIL ? 6 : 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 5
        });

        const materialTexto = new THREE.MeshPhongMaterial({
            color: 0xffd54f,
            emissive: 0x664200,
            specular: 0xffefbb,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        tituloPrimavera = new THREE.Mesh(geometriaTexto, materialTexto);

        geometriaTexto.computeBoundingBox();
        const centro = new THREE.Vector3();
        geometriaTexto.boundingBox.getCenter(centro);
        tituloPrimavera.position.x = -centro.x;
        tituloPrimavera.position.y = 15;
        tituloPrimavera.position.z = -5;

        tituloPrimavera.rotation.x = -0.2;

        escena.add(tituloPrimavera);
    } else {
        crearTituloPrimaveraRespaldo();
    }
}

function crearTituloPrimaveraRespaldo() {
    tituloPrimavera = crearTextoRespaldo('FELIZ PRIMAVERA');
    tituloPrimavera.position.set(0, 15, -5);
    escena.add(tituloPrimavera);
}

// Modelo compartido para el girasol central y las flores que caen.
let modeloGirasol;
function construirGirasol() {
    const grupo = new THREE.Group();
    const petaloGeo = new THREE.SphereGeometry(1, 12, 8);
    const petaloMat = new THREE.MeshPhongMaterial({ color: 0xffca28, emissive: 0x553000, shininess: 55 });
    const petaloTraseroMat = new THREE.MeshPhongMaterial({ color: 0xeeb01d, emissive: 0x382000, shininess: 40 });
    const dummyPetalo = new THREE.Object3D();
    for (let fila = 0; fila < 2; fila++) {
        const petalos = new THREE.InstancedMesh(petaloGeo, fila ? petaloMat : petaloTraseroMat, 18);
        petalos.frustumCulled = false;
        for (let i = 0; i < 18; i++) {
            const angulo = (i + fila * 0.5) * Math.PI * 2 / 18;
            dummyPetalo.scale.set(0.52, fila ? 1.65 : 1.8, 0.19);
            dummyPetalo.position.set(Math.cos(angulo) * 2.65, Math.sin(angulo) * 2.65, fila * 0.2);
            dummyPetalo.rotation.set(0, 0, angulo - Math.PI / 2);
            dummyPetalo.updateMatrix();
            petalos.setMatrixAt(i, dummyPetalo.matrix);
        }
        grupo.add(petalos);
    }
    const centro = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16),
        new THREE.MeshPhongMaterial({ color: 0x50301a, emissive: 0x160a03, shininess: 15 }));
    centro.scale.set(1.68, 1.68, 0.48); centro.position.z = 0.22; grupo.add(centro);
    const semillas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 6, 4),
        new THREE.MeshPhongMaterial({ color: 0xc29448 }), 240);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 120; i++) {
        const r = 1.5 * Math.sqrt(i / 120), a = i * 2.399963;
        for (let cara = 0; cara < 2; cara++) {
            const z = 0.22 + (cara ? -1 : 1) * (0.49 * Math.sqrt(1 - r * r / (1.68 * 1.68)));
            dummy.position.set(r * Math.cos(a), r * Math.sin(a), z); dummy.updateMatrix();
            semillas.setMatrixAt(i * 2 + cara, dummy.matrix);
        }
    }
    semillas.frustumCulled = false;
    grupo.add(semillas);
    return grupo;
}
function crearGirasolConPuntos() {
    modeloGirasol = construirGirasol();
    girasol = modeloGirasol.clone();
    girasol.scale.setScalar(1.65);
    escena.add(girasol);
}

function crearAnilloTexto() {
    const radio = 10;
    const totalLetras = textoAnillo.length;
    const pasoAngulo = (Math.PI * 2) / totalLetras;

    const geometriaAnilloInterno = new THREE.RingGeometry(6.8, 7.2, 64);
    const materialAnilloInterno = new THREE.MeshPhongMaterial({
        color: 0xffd54f,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
        emissive: 0x332200
    });
    const anilloInterno = new THREE.Mesh(geometriaAnilloInterno, materialAnilloInterno);
    anilloInterno.rotation.x = Math.PI / 2 + 0.1;
    escena.add(anilloInterno);

    const geometriaAnilloExterno = new THREE.RingGeometry(12.8, 13.2, 64);
    const materialAnilloExterno = new THREE.MeshPhongMaterial({
        color: 0xffd54f,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
        emissive: 0x332200
    });
    const anilloExterno = new THREE.Mesh(geometriaAnilloExterno, materialAnilloExterno);
    anilloExterno.rotation.x = Math.PI / 2 + 0.1;
    escena.add(anilloExterno);

    if (fuente) {
        for (let i = 0; i < totalLetras; i++) {
            const letra = textoAnillo[i];

            const geometriaTexto = new THREE.TextGeometry(letra, {
                font: fuente,
                size: 0.5,
                height: 0.05,
                curveSegments: ES_MOVIL ? 6 : 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.02,
                bevelSegments: 3
            });

            const materialTexto = new THREE.MeshPhongMaterial({
                color: 0xffd54f,
                emissive: 0x554000,
                specular: 0xffefbb,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });

            const mallaTexto = new THREE.Mesh(geometriaTexto, materialTexto);

            const angulo = -i * pasoAngulo;
            mallaTexto.position.x = Math.cos(angulo) * radio;
            mallaTexto.position.z = Math.sin(angulo) * radio;
            mallaTexto.position.y = 0;

            mallaTexto.rotation.y = angulo + Math.PI;
            mallaTexto.rotation.x = Math.PI / 2;

            escena.add(mallaTexto);
            objetosTextoAnillo.push(mallaTexto);
        }
    } else {
        crearAnilloRespaldo();
    }
}

function crearAnilloRespaldo() {
    const radio = 10;
    const totalEsferas = textoAnillo.length * 2;
    const pasoAngulo = (Math.PI * 2) / totalEsferas;

    for (let i = 0; i < totalEsferas; i++) {
        const geometriaEsfera = new THREE.SphereGeometry(0.12, 8, 8);
        const materialEsfera = new THREE.MeshPhongMaterial({
            color: 0xffd54f,
            emissive: 0x554000,
            transparent: true,
            opacity: 0.9
        });

        const esfera = new THREE.Mesh(geometriaEsfera, materialEsfera);

        const angulo = i * pasoAngulo;
        esfera.position.x = Math.cos(angulo) * radio;
        esfera.position.z = Math.sin(angulo) * radio;
        esfera.position.y = 0;

        escena.add(esfera);
        objetosTextoAnillo.push(esfera);
    }
}

function crearCampoEstrellas() {
    const geometriaEstrellas = new THREE.BufferGeometry();
    const materialEstrellas = new THREE.PointsMaterial({
        color: 0xffffff, size: 0.2, transparent: true, sizeAttenuation: true
    });

    const verticesEstrellas = [];
    for (let i = 0; i < (ES_MOVIL ? 4000 : 10000); i++) {
        verticesEstrellas.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
    }

    geometriaEstrellas.setAttribute('position', new THREE.Float32BufferAttribute(verticesEstrellas, 3));
    const campoEstrellas = new THREE.Points(geometriaEstrellas, materialEstrellas);
    escena.add(campoEstrellas);
}

function crearMensajesBonitos() {
    const mensajesMezclados = [...mensajesBonitos].sort(() => Math.random() - 0.5);
    const mensajesAUsar = mensajesMezclados.slice(0, ES_MOVIL ? 28 : 40);

    mensajesAUsar.forEach((mensaje, i) => {
        let mallaTexto;

        if (fuente) {
            const geometriaTexto = new THREE.TextGeometry(mensaje, {
                font: fuente, 
                size: 0.5, 
                height: 0.1, 
                curveSegments: ES_MOVIL ? 4 : 8,
                bevelEnabled: true, 
                bevelThickness: 0.02, 
                bevelSize: 0.03, 
                bevelSegments: 3
            });

            geometriaTexto.computeBoundingBox();
            geometriaTexto.center();

            mallaTexto = new THREE.Mesh(geometriaTexto, crearMaterialTexto());
        } else {
            mallaTexto = crearTextoRespaldo(mensaje);
        }

        const distancia = 15 + Math.random() * 10;
        const angulo = Math.random() * Math.PI * 2;
        const altura = (Math.random() - 0.5) * 15;

        mallaTexto.position.set(Math.cos(angulo) * distancia, altura, Math.sin(angulo) * distancia);

        escena.add(mallaTexto);
        objetosMensaje.push({
            malla: mallaTexto,
            alturaOriginal: altura,
            velocidad: 0.2 + Math.random() * 0.3,
            angulo: angulo,
            distancia: distancia
        });
    });
}

// Palabras ligeras (texto plano) para llenar más la galaxia sin cargar el celular.
// Para más o menos palabras, cambia estos números.
const PALABRAS_EXTRA = ES_MOVIL ? 24 : 45;
const palabrasExtra = [];
const muestraFps = { t: 0, n: 0, listo: false };

function crearPalabrasExtra() {
    const materiales = {};
    for (let i = 0; i < PALABRAS_EXTRA; i++) {
        const texto = mensajesBonitos[Math.floor(Math.random() * mensajesBonitos.length)];
        if (!materiales[texto]) {
            const lienzo = document.createElement('canvas');
            lienzo.width = 512; lienzo.height = 64;
            const ctx = lienzo.getContext('2d');
            ctx.font = 'bold 34px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowColor = '#ffcf40'; ctx.shadowBlur = 8;
            ctx.fillStyle = '#ffe38b'; ctx.fillText(texto, 256, 32, 490);
            const textura = new THREE.CanvasTexture(lienzo);
            textura.generateMipmaps = false;
            textura.minFilter = THREE.LinearFilter;
            materiales[texto] = new THREE.SpriteMaterial({ map: textura, transparent: true, opacity: 0.75, depthWrite: false });
        }
        const sprite = new THREE.Sprite(materiales[texto]);
        sprite.scale.set(7, 0.875, 1);
        const distancia = 26 + Math.random() * 24;
        const angulo = Math.random() * Math.PI * 2;
        const altura = (Math.random() - 0.5) * 32;
        sprite.position.set(Math.cos(angulo) * distancia, altura, Math.sin(angulo) * distancia);
        escena.add(sprite);
        const obj = { malla: sprite, alturaOriginal: altura, velocidad: 0.15 + Math.random() * 0.25, angulo, distancia };
        objetosMensaje.push(obj);
        palabrasExtra.push(obj);
    }
}

// Si el dispositivo va lento (menos de 28 fps), oculta la mitad de las palabras extra.
function vigilarRendimiento(dt) {
    muestraFps.t += dt; muestraFps.n++;
    if (muestraFps.t < 2.5) return;
    const fps = muestraFps.n / muestraFps.t;
    const evaluar = muestraFps.listo;
    muestraFps.t = 0; muestraFps.n = 0; muestraFps.listo = true;
    if (!evaluar || fps >= 28) return;
    const visibles = palabrasExtra.filter(p => p.malla.visible);
    visibles.slice(0, Math.ceil(visibles.length / 2)).forEach(p => { p.malla.visible = false; });
}

function crearMaterialTexto() {
    return new THREE.MeshStandardMaterial({
        color: 0xffd54f, 
        emissive: 0x554000,
        emissiveIntensity: 0.8,
        metalness: 0.3,
        roughness: 0.7,
        transparent: true, 
        opacity: 0.9
    });
}

function crearTextoRespaldo(mensaje) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 58px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffe38b'; ctx.fillText(mensaje, 512, 64, 980);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(10, 1.25, 1);
    return sprite;
}

function crearParticulasFlotantes() {
    const geometriaParticulas = new THREE.BufferGeometry();
    const cantidadParticulas = ES_MOVIL ? 600 : 1200;

    const posiciones = new Float32Array(cantidadParticulas * 3);
    const colores = new Float32Array(cantidadParticulas * 3);

    for (let i = 0; i < cantidadParticulas * 3; i += 3) {
        posiciones[i] = (Math.random() - 0.5) * 200;
        posiciones[i + 1] = (Math.random() - 0.5) * 200;
        posiciones[i + 2] = (Math.random() - 0.5) * 200;

        colores[i] = Math.random() * 0.5 + 0.5;
        colores[i + 1] = Math.random() * 0.3 + 0.3;
        colores[i + 2] = Math.random() * 0.7 + 0.3;
    }

    geometriaParticulas.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
    geometriaParticulas.setAttribute('color', new THREE.BufferAttribute(colores, 3));

    const materialParticulas = new THREE.PointsMaterial({
        size: 0.1, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.7
    });

    const particulas = new THREE.Points(geometriaParticulas, materialParticulas);
    escena.add(particulas);
}

function configurarEventos() {
    const lienzo = renderizador.domElement;
    let inicio = null;
    // Un toque/clic simple = explosión. Arrastrar o pellizcar solo mueve la cámara.
    lienzo.addEventListener('pointerdown', e => {
        inicio = e.isPrimary ? { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() } : null;
    });
    lienzo.addEventListener('pointerup', e => {
        if (!inicio || inicio.id !== e.pointerId || (e.pointerType === 'mouse' && e.button !== 0)) return;
        const esToque = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) < 12 && performance.now() - inicio.t < 600;
        inicio = null;
        if (esToque) { manejarInteraccion(e); mostrarEfectoToque(e); }
    });
    lienzo.addEventListener('pointercancel', () => { inicio = null; });

    // Los navegadores móviles solo dejan iniciar audio dentro de un gesto del usuario.
    document.addEventListener('touchend', intentarInicioAudio, { passive: true });
    document.addEventListener('click', intentarInicioAudio);

    document.querySelectorAll('.elemento-galeria').forEach(elemento => {
        elemento.addEventListener('click', abrirModal);
    });
    document.querySelector('.boton-cerrar').addEventListener('click', cerrarModal);
    document.getElementById('modal-imagen').addEventListener('click', e => {
        if (e.target.id === 'modal-imagen') cerrarModal();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });
    document.getElementById('alternar-audio').addEventListener('click', alternarAudio);

    audioPagina.addEventListener('error', () => { audioHabilitado = false; audioReproducido = false; actualizarBotonAudio(); });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) audioPagina.pause();
        else if (audioHabilitado && audioReproducido) reproducirAudio();
    });

    window.addEventListener('resize', manejarRedimensionamiento);
    window.addEventListener('orientationchange', () => setTimeout(manejarRedimensionamiento, 250));
    if ('ResizeObserver' in window) {
        new ResizeObserver(manejarRedimensionamiento).observe(document.getElementById('contenedor-escena'));
    }
}

let audioBloqueadoPorUsuario = false;

function actualizarBotonAudio() {
    const boton = document.getElementById('alternar-audio');
    boton.textContent = audioHabilitado ? 'ON' : 'OFF';
    boton.style.background = audioHabilitado ? 'rgba(255, 204, 64, 0.3)' : 'rgba(255, 255, 255, 0.15)';
}

function reproducirAudio() {
    if (!audioHabilitado) return;
    const promesa = audioPagina.play();
    if (promesa && promesa.then) {
        promesa.then(() => { audioReproducido = true; }).catch(() => { audioReproducido = false; });
    }
}

function pausarAudio() {
    audioPagina.pause();
}

function alternarAudio() {
    audioHabilitado = !audioHabilitado;
    audioBloqueadoPorUsuario = !audioHabilitado;
    actualizarBotonAudio();
    if (audioHabilitado) reproducirAudio(); else pausarAudio();
}

function intentarInicioAudio(e) {
    if (audioReproducido || audioBloqueadoPorUsuario) return;
    if (e && e.target && e.target.closest && e.target.closest('#alternar-audio')) return;
    audioHabilitado = true;
    actualizarBotonAudio();
    reproducirAudio();
}

function manejarInteraccion(e) {
    if (e.target.closest('.elemento-galeria') || e.target.closest('.modal') || e.target.closest('#alternar-audio') || document.getElementById('cargando').style.display !== 'none') return;

    intentarInicioAudio(e);

    crearExplosionTexto(e);
    crearLluviaGirasoles();

    contadorToques++;
    document.getElementById('instrucciones').textContent =
        mensajesDelDia[(contadorToques - 1) % mensajesDelDia.length];
}

function crearExplosionTexto(e) {
    const x = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const y = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    const textosBonitos = mensajesBonitos;
    const textoAleatorio = textosBonitos[Math.floor(Math.random() * textosBonitos.length)];

    const explosionTexto = document.createElement('div');
    explosionTexto.textContent = textoAleatorio;
    explosionTexto.style.position = 'absolute';
    explosionTexto.style.left = x + 'px';
    explosionTexto.style.top = y + 'px';
    explosionTexto.style.fontSize = 'clamp(18px, 5vw, 24px)';
    explosionTexto.style.color = '#ffe082';
    explosionTexto.style.fontWeight = 'bold';
    explosionTexto.style.textShadow = '0 0 10px #ffcf40';
    explosionTexto.style.zIndex = '20';
    explosionTexto.style.pointerEvents = 'none';
    explosionTexto.style.transform = 'translate(-50%, -50%)';
    explosionTexto.style.animation = 'animacionExplosionTexto 1.5s ease-out forwards';

    explosionTexto.style.whiteSpace = 'nowrap';
    document.getElementById('superposicion-ui').appendChild(explosionTexto);
    const anchoPantalla = window.innerWidth;
    const ancho = explosionTexto.offsetWidth || 1;
    const escala = Math.max(1, Math.min(3, (anchoPantalla * 0.9) / ancho));
    const mitad = (ancho * escala) / 2 + 6;
    explosionTexto.style.setProperty('--escala-final', escala);
    explosionTexto.style.left = Math.min(Math.max(x, mitad), Math.max(mitad, anchoPantalla - mitad)) + 'px';

    setTimeout(() => {
        if (explosionTexto.parentNode) explosionTexto.parentNode.removeChild(explosionTexto);
    }, 1500);
}



function mostrarEfectoToque(e) {
    if (e.target.closest('.elemento-galeria') || e.target.closest('.modal') || e.target.closest('#alternar-audio') || document.getElementById('cargando').style.display !== 'none') return;

    const indicador = document.getElementById('indicador-toque');
    const x = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const y = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    indicador.style.left = x + 'px';
    indicador.style.top = y + 'px';
    indicador.style.opacity = '1';

    setTimeout(() => { indicador.style.opacity = '0'; }, 300);
}

function crearLluviaGirasoles() {
    if (lluviaGirasolesActiva) return;

    lluviaGirasolesActiva = true;

    for (let i = 0; i < (ES_MOVIL ? 14 : 25); i++) {
        setTimeout(() => crearGirasol(), i * 80);
    }

    crearGirasoles3D();

    setTimeout(() => { lluviaGirasolesActiva = false; }, 3000);
}

function crearGirasol() {
    const girasol = document.createElement('div');
    girasol.innerHTML = '🌻';
    girasol.classList.add('girasol');
    girasol.style.left = Math.random() * 100 + 'vw';
    girasol.style.fontSize = (Math.random() * 20 + 18) + 'px';
    girasol.style.animationDuration = (Math.random() * 2 + 2) + 's';

    document.getElementById('superposicion-ui').appendChild(girasol);

    setTimeout(() => {
        if (girasol.parentNode) girasol.parentNode.removeChild(girasol);
    }, 5000);
}

function crearGirasoles3D() {
    const cantidad = ES_MOVIL ? 5 : 8;
    for (let i = 0; i < cantidad; i++) {
        const flor = modeloGirasol.clone();
        flor.scale.setScalar(0.10 + Math.random() * 0.06);
        flor.position.set((Math.random() - 0.5) * 20, 10 + Math.random() * 5, (Math.random() - 0.5) * 12);
        flor.userData.caida = (Math.random() * 0.05 + 0.02) * 60;
        flor.userData.giro = (Math.random() * 0.1 + 0.05) * 60;
        escena.add(flor);
        girasolesCayendo.push(flor);
    }
}

function actualizarGirasoles3D(dt) {
    for (let i = girasolesCayendo.length - 1; i >= 0; i--) {
        const flor = girasolesCayendo[i];
        flor.position.y -= flor.userData.caida * dt;
        flor.rotation.x += flor.userData.giro * dt;
        flor.rotation.z += flor.userData.giro * dt;
        if (flor.position.y <= -10) {
            escena.remove(flor);
            girasolesCayendo.splice(i, 1);
        }
    }
}

function abrirModal(e) {
    const indice = parseInt(e.currentTarget.getAttribute('data-indice'));
    const modal = document.getElementById('modal-imagen');
    const imagenModal = document.getElementById('imagen-modal');
    const mensajeModal = document.getElementById('mensaje-modal');

    imagenModal.textContent = '🌻';
    imagenModal.dataset.indice = String(indice);
    const opciones = [mensajesImagen[indice], ...mensajesDelDia.filter((_, i) => i % 4 === indice)];
    const visita = Number(e.currentTarget.dataset.visitas || 0);
    mensajeModal.textContent = opciones[visita % opciones.length];
    e.currentTarget.dataset.visitas = String(visita + 1);

    modal.style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-imagen').style.display = 'none';
}

function aplicarEncuadre(forzar) {
    const c = document.getElementById('contenedor-escena');
    const aspecto = Math.max(c.clientWidth, 1) / Math.max(c.clientHeight, 1);
    const t = aspecto >= 1 ? 0 : Math.min(1, (1 - aspecto) / 0.6);
    const vertical = aspecto < 1;
    camara.aspect = aspecto;
    camara.fov = 60 + 18 * t;
    camara.updateProjectionMatrix();
    controles.maxDistance = 50 + 30 * t;
    if (forzar || vertical !== eraVertical) camara.position.setLength(31 + 17 * t);
    eraVertical = vertical;
}

function manejarRedimensionamiento() {
    if (!renderizador) return;
    const c = document.getElementById('contenedor-escena');
    renderizador.setSize(c.clientWidth, c.clientHeight);
    aplicarEncuadre(false);
}

function animar() {
    requestAnimationFrame(animar);

    const ahora = performance.now();
    const dt = Math.min((ahora - ultimoFrame) / 1000, 0.1);
    ultimoFrame = ahora;
    const tiempo = ahora * 0.001;
    actualizarGirasoles3D(dt);
    vigilarRendimiento(dt);

    girasol.rotation.y = Math.sin(tiempo * 0.35) * 0.35;
    girasol.rotation.z = Math.sin(tiempo * 0.22) * 0.07;
    girasol.rotation.x = Math.sin(tiempo) * 0.1;


    if (tituloPrimavera) {
        tituloPrimavera.position.y = 15 + Math.sin(tiempo * 0.3) * 0.5;
    }

    objetosTextoAnillo.forEach((obj, i) => {
        obj.rotation.y += 0.001;
        obj.position.y = Math.sin(tiempo + i * 0.1) * 0.2;

        obj.lookAt(camara.position);
    });

    objetosMensaje.forEach((obj, i) => {
        obj.malla.position.y = obj.alturaOriginal + Math.sin(tiempo * obj.velocidad + i) * 1.5;
        obj.angulo += 0.001 * obj.velocidad;
        obj.malla.position.x = Math.cos(obj.angulo) * obj.distancia;
        obj.malla.position.z = Math.sin(obj.angulo) * obj.distancia;

        obj.malla.lookAt(camara.position);
    });

    controles.update();
    renderizador.render(escena, camara);
}

cargarRecursos().then(() => {
    crearEstrellasCSS(ES_MOVIL ? 70 : 150);
    simularCarga();
});
