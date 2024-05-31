import Server from "./classes/server";
import userRoutes from "./routes/usuario";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import ventaRoutes from "./routes/venta";
import productoRoutes from "./routes/producto"


const cors = require('cors');
const server = new Server();


//Body Parser
server.app.use(bodyParser.urlencoded({extended: true}));
server.app.use(bodyParser.json());

//Cors
server.app.use(cors({origin:true, credentials:true}));

//Rutas de mi App
server.app.use('/user',userRoutes);
server.app.use('/venta',ventaRoutes);
server.app.use('/producto',productoRoutes)


//Conectar DB
//mongoose.connect('mongodb://localhost:27017/fotosgram')
//mongoose.connect('mongodb://localhost:27017/zap')
//mongoose.connect('mongodb://localhost:27017/puntoVenta')
mongoose.connect('mongodb://localhost:27017/Bicicletas')

//Levantar express
server.start(() => {
    console.log(`Servidor corriendo en puerto ${server.port}`);    
});
