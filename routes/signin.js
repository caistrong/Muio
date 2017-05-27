/**
 * Created by caistrong on 17-5-27.
 */
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users')
var checkNotLogin = require('../middlewares/check').checkNotLogin;

router.get('/',checkNotLogin,function (req,res,next) {
    res.render('signin');
});

router.post('/',checkNotLogin,function (req,res,next) {
    var name = req.fields.name;
    var password = req.fields.password;

    UserModel.getUserByName(name)
        .then(function (user) {
            if(!user){
                req.flash('error','用户不存在');
                return res.redirect('back');
            }
            if(sha1(password)!==user.password){
                req.flash('success','密码错误');
                return res.redirect('back');
            }
            req.flash('success','登录成功');
            //用户信息写入session
            delete user.password;
            req.session.user = user;
            //跳转回主页
            res.redirect('/posts');
        })
        .catch(next);
})

module.exports= router;