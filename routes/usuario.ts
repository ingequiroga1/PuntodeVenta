import { Router,Request,Response } from 'express';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import Token from '../classes/token';
import { verificaToken } from '../middlewares/autenticacion';

const userRoutes = Router();

// userRoutes.get('/prueba',(req: Request,res: Response)=>{
//     res.json({
//         ok: true,
//         mensaje: 'todo funciona bien'
//     })
// });

//Login
userRoutes.post('/login',(req: Request, res: Response)=>{

    const body = req.body;
  
    Usuario.findOne({email: body.email})
        .then(userDB => {
            // return userDB;
            
            if (!userDB) {
                return res.json({
                    ok: false,
                    mensaje: 'Usuario o contraseña no son correctos'
                })
            }


            if(userDB.CompararPassword(body.password)){

                const tokenUser = Token.getJwtToken({
                    _id: userDB._id,
                    nombre: userDB.nombre,
                    email: userDB.email,
                    avatar: userDB.avatar
                });

                res.json({
                    ok: true,
                    token: tokenUser
                });
            }else{
                return res.json({
                    ok: false,
                    mensaje: 'Usuario o contraseña no son correctos *****'
                }) 
            }
            
        }).catch(error =>{
            throw error;
        });
})


//Crear un usuario
userRoutes.post('/create',(req: Request,res: Response)=>{

    const user = {
        nombre: req.body.nombre,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        avatar: req.body.avatar
    }

    Usuario.create(user).then(userDB =>{

        const tokenUser = Token.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });

        res.json({
            ok: true,
            token: tokenUser
        });

        // res.json({
        //     ok: true,
        //     user: userDB
        // })
    }).catch(err => {
            res.json({
                ok: false,
                err
            });
        });
});


//Actualizar Usuario
userRoutes.post('/update',verificaToken,(req:any, res:Response)=>{
    const user = {
        nombre: req.body.nombre,
        email: req.body.email,
        avatar: req.body.avatar
    }

    Usuario.findByIdAndUpdate(req.usuario._id,user,{new:true})
        .then(userDB =>{
            if(!userDB){
                return res.json({
                    ok: false,
                    mensaje: 'No existe usuario con ese id'
                });
            }
            
            const tokenUser = Token.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                email: userDB.email,
                avatar: userDB.avatar
            });
    
            res.json({
                ok: true,
                token: tokenUser
            });

        }).catch(error =>{
            throw error;
        });
});


export default userRoutes;