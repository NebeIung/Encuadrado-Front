import { Box, Typography, Paper, Divider } from "@mui/material";

export default function Terminos() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main", textAlign: "center" }}>
        Términos y Condiciones
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 4 }}>
        Última actualización: Octubre 2025
      </Typography>

      <Paper sx={{ p: 4 }}>
        {/* Introducción */}
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          1. Introducción
        </Typography>
        <Typography paragraph>
          Bienvenido al Centro de Salud Cuad. Al utilizar nuestros servicios de agendamiento y atención 
          médica, usted acepta estos términos y condiciones en su totalidad. Si no está de acuerdo con 
          estos términos, por favor absténgase de utilizar nuestros servicios.
        </Typography>
        <Typography paragraph>
          Estos términos constituyen un acuerdo legal entre usted y el Centro de Salud Cuad. Nos reservamos 
          el derecho de modificar estos términos en cualquier momento, y dichas modificaciones entrarán en 
          vigencia inmediatamente después de su publicación en nuestro sitio web.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Servicios */}
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          2. Servicios Ofrecidos
        </Typography>
        <Typography paragraph>
          El Centro de Salud Cuad proporciona servicios de atención médica en diversas especialidades, 
          incluyendo pero no limitándose a consultas generales, nutrición, psicología, kinesiología y pediatría. 
          Todos nuestros servicios son prestados por profesionales debidamente licenciados y calificados.
        </Typography>
        <Typography paragraph>
          Nos comprometemos a brindar atención médica de calidad, respetando siempre los estándares éticos 
          y profesionales establecidos por las autoridades sanitarias competentes. Sin embargo, los resultados 
          de los tratamientos pueden variar según las características individuales de cada paciente.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Agendamiento */}
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          3. Proceso de Agendamiento
        </Typography>
        <Typography paragraph>
          El agendamiento de citas puede realizarse a través de nuestra plataforma online o por contacto 
          telefónico. Al agendar una cita, el paciente se compromete a asistir en el horario establecido 
          o a cancelar con al menos 24 horas de anticipación.
        </Typography>
        <Typography paragraph>
          En caso de inasistencia sin aviso previo o cancelaciones reiteradas, nos reservamos el derecho 
          de aplicar políticas de penalización o restricción de futuros agendamientos. Las cancelaciones 
          deben realizarse con la debida antelación para permitir que otros pacientes puedan utilizar el 
          horario disponible.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Privacidad */}
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          4. Privacidad y Protección de Datos
        </Typography>
        <Typography paragraph>
          El Centro de Salud Cuad se compromete a proteger la privacidad y confidencialidad de la información 
          médica y personal de sus pacientes, de acuerdo con la Ley de Protección de Datos Personales vigente 
          en Chile. Toda la información proporcionada será utilizada exclusivamente para fines relacionados 
          con la prestación de servicios de salud.
        </Typography>
        <Typography paragraph>
          Los datos personales y médicos de nuestros pacientes son almacenados de manera segura y solo son 
          accesibles por el personal autorizado. No compartimos información personal con terceros sin el 
          consentimiento explícito del paciente, excepto cuando sea requerido por ley.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Pagos */}
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          5. Pagos y Tarifas
        </Typography>
        <Typography paragraph>
          Las tarifas de nuestros servicios están claramente indicadas en nuestra plataforma. Los pagos 
          deben realizarse en el momento de la atención, salvo acuerdo previo diferente. Aceptamos pagos 
          en efectivo, tarjetas de débito y crédito, y transferencias bancarias.
        </Typography>
        <Typography paragraph>
          Los precios pueden estar sujetos a cambios, pero cualquier modificación será comunicada con 
          anticipación. En caso de tener cobertura de seguros de salud, es responsabilidad del paciente 
          verificar la cobertura antes de la consulta. Emitimos boletas y facturas según lo requiera el paciente.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Responsabilidades */}
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          6. Responsabilidades del Paciente
        </Typography>
        <Typography paragraph>
          El paciente se compromete a proporcionar información veraz y completa sobre su estado de salud, 
          antecedentes médicos y alergias. Es fundamental que el paciente informe al profesional sobre 
          cualquier medicación que esté tomando o tratamientos previos que puedan ser relevantes para su atención.
        </Typography>
        <Typography paragraph>
          El paciente debe seguir las indicaciones y recomendaciones del profesional tratante. El incumplimiento 
          de las instrucciones médicas puede afectar los resultados del tratamiento, y el Centro de Salud Cuad 
          no se hace responsable por complicaciones derivadas del no seguimiento de las indicaciones médicas.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Limitaciones */}
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          7. Limitaciones de Responsabilidad
        </Typography>
        <Typography paragraph>
          Si bien nos esforzamos por proporcionar la mejor atención médica posible, el Centro de Salud Cuad 
          no garantiza resultados específicos de tratamientos o diagnósticos. La medicina no es una ciencia 
          exacta y los resultados pueden variar según múltiples factores individuales.
        </Typography>
        <Typography paragraph>
          En casos de emergencia médica, recomendamos acudir inmediatamente al servicio de urgencias más cercano 
          o llamar a los servicios de emergencia (131). Nuestro centro no cuenta con servicio de urgencias 
          las 24 horas.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Contacto */}
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          8. Contacto
        </Typography>
        <Typography paragraph>
          Para cualquier consulta sobre estos términos y condiciones, puede contactarnos a través de:
        </Typography>
        <Typography paragraph>
          <strong>Email:</strong> contacto@centrocuad.cl<br />
          <strong>Teléfono:</strong> +56 9 1234 5678<br />
          <strong>Dirección:</strong> Av. Providencia 1234, Santiago, Chile
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontStyle: "italic" }}>
          Al utilizar nuestros servicios, usted reconoce haber leído, entendido y aceptado estos términos 
          y condiciones en su totalidad.
        </Typography>
      </Paper>
    </Box>
  );
}