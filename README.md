# SM2_EXAMEN_PRACTICO

**Nombres**: Delgado Castillo, Jesus Angel  
**Curso**: Móviles II  
**Fecha**: 6/11/24  

## Historia de Usuario 1: Recuperación de Contraseña

**Descripción**:  
Como un usuario, quiero poder recuperar mi contraseña si la olvido para poder acceder a mi cuenta sin problemas.

### Funcionalidad:  
Permitir a los usuarios recuperar su contraseña mediante un enlace enviado a su correo electrónico.

---

### Rutas (`authRoutes`)

La ruta para solicitar la recuperación de contraseña:

```typescript
router.post('/forgot-password',  
    body('email')
       .isEmail().withMessage('E-mail no válido'),  // Validación de formato de email
    handleInputErrors,  // Middleware para manejar errores de entrada
    AuthController.forgotPassword  // Controlador que maneja la lógica de recuperación
);
```
### Controller (`authController`)
```
static forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Registro de la solicitud de recuperación
        logger.info(`Requesting password reset for email: ${email}`);

        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(`User not found for email: ${email}`);
            const error = new Error('Usuario no está registrado');
            return res.status(404).json({ error: error.message });
        }

        // Generación de token de recuperación
        const token = new Token();
        token.token = generateToken();  // Generar un token único
        console.log(token);
        token.user = user.id;  // Asociar el token con el usuario
        await token.save();

        // Enviar el correo electrónico con el token de recuperación
        await AuthEmail.sendPasswordResetToken({
            email: user.email,
            name: user.name,
            token: token.token
        });

        // Respuesta de éxito
        logger.info(`Password reset token sent to email: ${email}`);
        res.send('Revisa tu email para restablecer tu contraseña');
    } catch (error) {
        // Manejo de errores
        logger.error('Error in forgotPassword:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
};

```
![image](https://github.com/user-attachments/assets/3e52392a-c1d1-4f23-97bc-f10f8b2659a3)

## Historia de Usuario 2: Mensajes Temporales

**Descripción**:  
Como un usuario, quiero enviar mensajes temporales a otros usuarios para que pueda comunicarme sin que los mensajes sean almacenados permanentemente.

### Funcionalidad:  
Permitir a los usuarios enviar mensajes que desaparecen después de un tiempo determinado, sin que sean almacenados en la base de datos de forma permanente.

### Rutas (`conversationRoute`)
```
const express = require('express')
const authMiddlewareRoute = require('../middleware/authMiddlewareRoute')
const conversationController = require('../controllers/conversationController')
const router = express.Router()
const uploadImage = require('../utils/uploadImage')

router.use(authMiddlewareRoute)
router.post('/init',conversationController.initiateConversationController)

router.patch('/:id/editPhoto',uploadImage,conversationController.editPhotoConversationController)

module.exports = router
```
### Rutas (`conversationController`)
```
const emitUserConversations = async (socket, senderId) => {
  const responseConversations = await conversationService.getUserConversationsService(senderId);
  
  if (!responseConversations.success) {
    socket.emit('receiveUserConversations', {
      statusCode: 200,
      status: true,
      data: null,
    });
    return;
  }

  const responseDetailsMessageConversations = await Promise.all(
    responseConversations.data.map(async (message) => {
      const responseUnreadMessage = await messageService.getUnreadMessagesService(message._id, senderId);
      message._doc.countUnread = responseUnreadMessage.data;
      message.lastMessage.content = cryptoFeatures.decrypt(message.lastMessage.content);
      return message;
    })
  );
  socket.emit('receiveUserConversations', {
    statusCode: 200,
    status: true,
    data: responseDetailsMessageConversations,
  });
};

exports.initiateConversationController = catchAsync(async (req, res, next) => {
  const { userId, memberUserId, content } = req.body;

  if (requireField(userId, memberUserId, content)) {
    return next(new appError(translatorNext(req, 'MISSING_REQUIRED_FIELDS'), 400));
  }

  const response = await conversationService.initiateConversationService([{ userId: memberUserId }], userId, content);

  const socket = socketController()
  const io=socket.io

  const usersInvolved = [userId, memberUserId];

  usersInvolved.forEach(userId => {
    emitMessageToUser(io,userId, 'getUserConversations', {
      statusCode: response.status,
      status: response.success,
      data: response.data,
    });
  });

  resSend(res, { statusCode: response.status, status: response.success, data: response.data, message: response.code });
});

exports.getUserConversationsController = async (io, socket) => {
  await emitUserConversations(socket, socket.userId);
};
```

