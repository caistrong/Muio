/**
 * Created by caistrong on 17-5-27.
 */
module.exports={
    port:3000,
    session:{
        secret:'muioblog',
        key:'muioblog',
        maxAge:2592000000
    },
    mongodb:'mongodb://localhost:27017/muioblog'
};