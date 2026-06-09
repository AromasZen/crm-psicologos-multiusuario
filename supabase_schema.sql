-- ====================================================================
-- SCRIPT DE BASE DE DATOS PARA SUPABASE: TABLA DE RECURSOS COMERCIALES
-- Ejecutar este script en el editor SQL de Supabase (SQL Editor)
-- ====================================================================

-- 1. Crear la tabla de recursos
CREATE TABLE IF NOT EXISTS public.recursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('mensaje', 'objecion', 'caso_de_uso', 'consejo')),
    categoria VARCHAR(100), -- Para clasificar los mensajes: 'primer_contacto', 'seguimiento', 'recontacto', 'objecion', 'cierre'
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Deshabilitar Row Level Security (RLS) para accesos de lectura/escritura directos desde el cliente anon,
-- siguiendo la configuración actual del resto de las tablas en el CRM (como leads).
ALTER TABLE public.recursos DISABLE ROW LEVEL SECURITY;

-- 3. Limpiar datos existentes antes de sembrar (opcional, evita duplicados en re-ejecuciones)
TRUNCATE TABLE public.recursos;

-- 4. Insertar datos iniciales: Módulo de Mensajes
INSERT INTO public.recursos (tipo, categoria, titulo, contenido, orden) VALUES
('mensaje', 'primer_contacto', 'WhatsApp Frío - Psicólogos', 'Hola [Nombre], ¿cómo estás? Vi tu perfil y me gustó mucho cómo abordás la terapia. Te escribo porque ayudo a profesionales de salud a automatizar sus recordatorios de turnos por WhatsApp para reducir ausencias y ahorrar tiempo. ¿Te interesaría ver un video corto de 2 minutos sobre cómo funciona?', 1),
('mensaje', 'seguimiento', 'Seguimiento Corto (A las 48hs)', 'Hola [Nombre]! Te escribo para ver si pudiste revisar el videito de 2 minutos que te mandé el otro día. ¿Te sirvió? Contame si tenés alguna duda.', 2),
('mensaje', 'recontacto', 'Recontacto tras meses de inactividad', 'Hola [Nombre]! Espero que andes súper bien. Hace un tiempo charlamos sobre el sistema de recordatorios de turnos. Te comento que lanzamos una nueva versión que se conecta con Google Calendar de forma directa. ¿Cómo vienen tus ausencias de pacientes por estos días?', 3),
('mensaje', 'objecion', 'Objeción: Es muy caro', 'Entiendo perfectamente, el presupuesto siempre es clave. Pensalo de esta forma: el sistema cuesta lo mismo que media sesión al mes. Con que evites que un solo paciente falte sin avisar, el sistema ya se pagó solo. El resto es ganancia y tiempo libre para vos. ¿Te gustaría probarlo gratis 7 días y ver los resultados?', 4),
('mensaje', 'cierre', 'Cierre - Link de pago y setup', '¡Buenísimo, [Nombre]! Pasamos a activar tu cuenta. Acá te dejo el link para dar de alta la suscripción: [Link]. Una vez completado, nos conectamos 10 minutos por zoom y te dejo todo configurado listo para usar.', 5);

-- 5. Insertar datos iniciales: Módulo de Objeciones
INSERT INTO public.recursos (tipo, categoria, titulo, contenido, orden) VALUES
('objecion', NULL, 'Ya tengo página web', '¡Qué bueno que ya tengas web! Eso facilita mucho que te encuentren. Nuestro sistema no reemplaza tu web, sino que se integra para que cuando reserven un turno, les llegue un recordatorio automático por WhatsApp. Las webs comunes suelen enviar mails que la gente no lee, mientras que WhatsApp tiene 98% de apertura. ¿Te gustaría ver cómo se integraría?', 1),
('objecion', NULL, 'Ya uso WhatsApp', 'Buenísimo, hoy en día es el canal principal. La diferencia es que nuestro sistema envía los recordatorios de manera automática y programada desde la nube, liberándote de tener que tipear o mandar mensajes uno por uno cada día. ¿Cuánto tiempo le dedicás hoy a agendar y recordar turnos manualmente?', 2),
('objecion', NULL, 'No tengo tiempo', 'Entiendo que estés a mil. Justamente por eso te va a servir: el objetivo del sistema es automatizar una tarea que hoy te quita tiempo valioso de tu día. Te ahorra entre 5 y 10 horas mensuales de gestión. ¿Te parece si coordinamos una llamada rápida de 10 minutos para ver si podemos simplificar tu agenda?', 3),
('objecion', NULL, 'No tengo pacientes suficientes', 'Comprendo. Justamente cuando uno está creciendo es fundamental brindar una experiencia profesional y evitar que los pocos pacientes que agendan se olviden de asistir. Además, el sistema te ayuda a fidelizarlos y automatizar el recontacto. ¿Te interesaría probarlo gratis para optimizar tu proceso desde el inicio?', 4),
('objecion', NULL, 'Es muy caro', 'Entiendo. Sin embargo, si lo pensás bien, el costo mensual equivale a una fracción de una sola sesión de terapia. Si el sistema evita que un solo paciente te cancele sobre la hora o falte en todo el mes, ya recuperaste la inversión. El resto del tiempo y dinero que ahorrás es ganancia pura. ¿Querés probarlo gratis 7 días?', 5);

-- 6. Insertar datos iniciales: Módulo de Casos de Uso
INSERT INTO public.recursos (tipo, categoria, titulo, contenido, orden) VALUES
('caso_de_uso', NULL, 'Psicólogos y Psicoterapeutas', 'Es el caso de uso principal. Los pacientes suelen olvidar las sesiones recurrentes o cancelar tarde. Con recordatorios 24 horas antes, disminuyen el ausentismo en un 80% y aseguran el cobro de la sesión.', 1),
('caso_de_uso', NULL, 'Nutricionistas y Dietistas',
 'Ideal para enviar pautas antes de la consulta (como ayunos o estudios previos) junto con el recordatorio del turno. Ayuda a mantener la constancia en los tratamientos de mediano plazo.', 2),
('caso_de_uso', NULL, 'Kinesiólogos y Fisioterapeutas', 'Pacientes con sesiones semanales o derivaciones médicas. El ausentismo interrumpe el tratamiento. Los recordatorios automáticos garantizan que completen sus sesiones programadas.', 3),
('caso_de_uso', NULL, 'Médicos (Consultorios Privados)', 'Permite descongestionar la recepción del consultorio. En vez de que la secretaria llame por teléfono uno por uno, el sistema se encarga de confirmar las citas de la agenda.', 4),
('caso_de_uso', NULL, 'Abogados y Consultores', 'Ideal para profesionales que cobran por hora de asesoría. Evita la pérdida de horas facturables por clientes que no asisten a las reuniones virtuales o presenciales.', 5),
('caso_de_uso', NULL, 'Coaches y Mentores', 'Perfecto para sesiones de coaching personal o grupal. Permite enviar el enlace de Zoom/Meet automáticamente en el mismo recordatorio de WhatsApp unas horas antes de la sesión.', 6);

-- 7. Insertar datos iniciales: Módulo de Consejos
INSERT INTO public.recursos (tipo, categoria, titulo, contenido, orden) VALUES
('consejo', NULL, 'Cómo iniciar conversaciones', 'No vendas de entrada. Primero entablá una relación o hacé una pregunta genuina sobre su consultorio o cómo gestionan sus turnos. Por ejemplo: ''Hola Doc, ¿cómo manejás las cancelaciones de turnos hoy en día?'' o busca perfiles de Instagram que tengan enlaces a agendas manuales.', 1),
('consejo', NULL, 'Cómo detectar interés', 'Buscá señales de dolor: si se quejan de que la gente falta, si tardan mucho en responder, o si comentan que la agenda es un caos. Cuando te pregunten ''¿cómo funciona?'' o ''¿cuánto cuesta?'', es momento de ofrecerles una demo corta o el video de 2 minutos.', 2),
('consejo', NULL, 'Cómo hacer seguimiento', 'Hacé seguimiento cada 48-72 horas de forma amigable. No presiones. Compartí un testimonio o hacé una pregunta simple: ''¿Pudiste ver lo que te envié?'' o ''¿Querés que configuremos tu prueba gratuita en 5 minutos?''.', 3),
('consejo', NULL, 'Errores comunes', '1. Mandar un texto gigante en el primer mensaje (parece spam). 2. Presionar demasiado rápido por la venta. 3. No hacer seguimiento (el 80% de las ventas se concretan entre el 3er y 5to contacto). 4. No personalizar el nombre del profesional.', 4);
