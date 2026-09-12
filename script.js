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
        estrella.style.left = Math.random() * 100 + 'vw';
        estrella.style.top = Math.random() * 100 + 'vh';
        estrella.style.setProperty('--retraso', Math.random() * 5 + 's');
        estrella.style.setProperty('--duracion', (Math.random() * 4 + 2) + 's');
        cielo.appendChild(estrella);
    }
}

function cargarRecursos() {
    return Promise.all([
        new Promise((resolver) => {
            cargadorFuentes.load(
                'https://threejs.org/examples/fonts/gentilis_regular.typeface.json',
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
    ]);
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
        inicializarEscena();
    }, 1500);
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

    renderizador = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance" 
    });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    renderizador.toneMapping = THREE.ACESFilmicToneMapping;
    renderizador.toneMappingExposure = 1.2;
    renderizador.setClearColor(0x000000, 0);

    document.getElementById('contenedor-escena').appendChild(renderizador.domElement);

    controles = new THREE.OrbitControls(camara, renderizador.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.05;
    controles.rotateSpeed = 0.5;
    controles.enableZoom = true;
    controles.autoRotate = true;
    controles.autoRotateSpeed = 0.2;
    controles.minDistance = 15;
    controles.maxDistance = 50;

    controles.addEventListener('change', manejarMovimientoCamara);

    const luzAmbiental = new THREE.AmbientLight(0x444477, 0.4);
    escena.add(luzAmbiental);

    const luzDireccional = new THREE.DirectionalLight(0xffffff, 1.5);
    luzDireccional.position.set(10, 10, 5);
    luzDireccional.castShadow = true;
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
    crearParticulasFlotantes();

    configurarEventos();

    animar();
}

function crearTituloPrimavera() {
    if (fuente) {
        const geometriaTexto = new THREE.TextGeometry("FELIZ PRIMAVERA", {
            font: fuente,
            size: 1.15,
            height: 0.5,
            curveSegments: 12,
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
    for (let fila = 0; fila < 2; fila++) {
        for (let i = 0; i < 18; i++) {
            const angulo = (i + fila * 0.5) * Math.PI * 2 / 18;
            const petalo = new THREE.Mesh(petaloGeo, fila ? petaloMat : petaloTraseroMat);
            petalo.scale.set(0.52, fila ? 1.65 : 1.8, 0.19);
            petalo.position.set(Math.cos(angulo) * 2.65, Math.sin(angulo) * 2.65, fila * 0.2);
            petalo.rotation.z = angulo - Math.PI / 2;
            grupo.add(petalo);
        }
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
                curveSegments: 12,
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
    for (let i = 0; i < 10000; i++) {
        verticesEstrellas.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
    }

    geometriaEstrellas.setAttribute('position', new THREE.Float32BufferAttribute(verticesEstrellas, 3));
    const campoEstrellas = new THREE.Points(geometriaEstrellas, materialEstrellas);
    escena.add(campoEstrellas);
}

function crearMensajesBonitos() {
    const mensajesMezclados = [...mensajesBonitos].sort(() => Math.random() - 0.5);
    const mensajesAUsar = mensajesMezclados.slice(0, 40);

    mensajesAUsar.forEach((mensaje, i) => {
        let mallaTexto;

        if (fuente) {
            const geometriaTexto = new THREE.TextGeometry(mensaje, {
                font: fuente, 
                size: 0.5, 
                height: 0.1, 
                curveSegments: 8,
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
    const cantidadParticulas = 1200;

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
    document.addEventListener('click', manejarInteraccion);
    

    document.addEventListener('click', mostrarEfectoToque);
    

    document.querySelectorAll('.elemento-galeria').forEach(elemento => {
        elemento.addEventListener('click', abrirModal);
    });

    document.querySelector('.boton-cerrar').addEventListener('click', cerrarModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

    document.getElementById('alternar-audio').addEventListener('click', alternarAudio);

    window.addEventListener('resize', manejarRedimensionamiento);
    window.addEventListener('wheel', manejarDesplazamiento);
}

function manejarMovimientoCamara() {
    if (audioHabilitado && !audioReproducido) {
        reproducirAudio();
    }
}

function manejarDesplazamiento() {
    if (audioHabilitado && !audioReproducido) {
        reproducirAudio();
    }
}

function alternarAudio() {
    audioHabilitado = !audioHabilitado;
    const botonAudio = document.getElementById('alternar-audio');

    if (audioHabilitado) {
        botonAudio.textContent = 'ON';
        botonAudio.style.background = 'rgba(255, 204, 64, 0.3)';
        reproducirAudio();
    } else {
        botonAudio.textContent = 'OFF';
        botonAudio.style.background = 'rgba(255, 255, 255, 0.15)';
        pausarAudio();
    }
}

function reproducirAudio() {
    const audio = document.getElementById('audio-fondo');
    if (audioHabilitado) {
        audio.play().then(() => {
            audioReproducido = true;
        }).catch(e => {
            console.log("Audio requiere interacción del usuario primero para reproducirse.");
        });
    }
}

function pausarAudio() {
    const audio = document.getElementById('audio-fondo');
    audio.pause();
}

function manejarInteraccion(e) {
    if (e.target.closest('.elemento-galeria') || e.target.closest('.modal') || e.target.closest('#alternar-audio') || document.getElementById('cargando').style.display !== 'none') return;

    if (!audioReproducido) {
        audioHabilitado = true;
        document.getElementById('alternar-audio').textContent = 'ON';
        document.getElementById('alternar-audio').style.background = 'rgba(255, 204, 64, 0.3)';
        reproducirAudio();
    }

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
    explosionTexto.innerHTML = textoAleatorio;
    explosionTexto.style.position = 'absolute';
    explosionTexto.style.left = x + 'px';
    explosionTexto.style.top = y + 'px';
    explosionTexto.style.fontSize = '24px';
    explosionTexto.style.color = '#ffe082';
    explosionTexto.style.fontWeight = 'bold';
    explosionTexto.style.textShadow = '0 0 10px #ffcf40';
    explosionTexto.style.zIndex = '20';
    explosionTexto.style.pointerEvents = 'none';
    explosionTexto.style.transform = 'translate(-50%, -50%)';
    explosionTexto.style.animation = 'animacionExplosionTexto 1.5s ease-out forwards';

    document.getElementById('superposicion-ui').appendChild(explosionTexto);

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

    for (let i = 0; i < 25; i++) {
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
    for (let i = 0; i < 8; i++) {
        const flor = modeloGirasol.clone();
        flor.scale.setScalar(0.10 + Math.random() * 0.06);
        flor.position.set((Math.random() - 0.5) * 20, 10 + Math.random() * 5, (Math.random() - 0.5) * 12);
        escena.add(flor);
        animarGirasol3D(flor);
    }
}

function animarGirasol3D(girasol) {
    const velocidadCaida = Math.random() * 0.05 + 0.02;
    const velocidadRotacion = Math.random() * 0.1 + 0.05;

    function animar() {
        girasol.position.y -= velocidadCaida;
        girasol.rotation.x += velocidadRotacion;
        girasol.rotation.z += velocidadRotacion;

        if (girasol.position.y > -10) {
            requestAnimationFrame(animar);
        } else {
            escena.remove(girasol);
        }
    }

    animar();
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

function manejarRedimensionamiento() {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
}

function animar() {
    requestAnimationFrame(animar);

    const tiempo = Date.now() * 0.001;

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
    crearEstrellasCSS(150);
    simularCarga();
});
