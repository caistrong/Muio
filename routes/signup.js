/**
 * Created by caistrong on 17-5-27.
 */
var express = require('express');
var path = require('path');
var sha1 = require('sha1');
var fs = require('fs');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

//获取注册页
router.get('/',checkNotLogin,function (req,res,next) {
    res.render('signup');
});

//注册
router.post('/',checkNotLogin,function (req,res,next) {
    var name =req.fields.name;
    var gender = req.fields.gender;
    var bio = req.fields.bio;
    var avatar = req.files.avatar.path.split(path.sep).pop();
    var password = req.fields.password;
    var repassword = req.fields.repassword;

    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字请限制在 1-10 个字符');
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error('性别只能是 m、f 或 x');
        }
        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介请限制在 1-30 个字符');
        }
        if (!req.files.avatar.name) {
            throw new Error('缺少头像');
        }
        if (password.length < 6) {
            throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }
    } catch (e) {
        // 注册失败，异步删除上传的头像
        fs.unlink(req.files.avatar.path);
        
        req.flash('error', e.message);
        return res.redirect('/signup');
    }
    password =sha1(password);
    
    //组织以下要写入数据库的用户信息
    var user ={
        name: name,
        password:password,
        gender:gender,
        bio:bio,
        avatar:avatar
    };
    
    UserModel.create(user)
        .then(function (result) {
            // 此 user 是插入 mongodb 后的值，包含 _id
            user = result.ops[0];
            // 将用户信息存入 session
            delete user.password;
            req.session.user = user;
            // 写入 flash
            req.flash('success', '注册成功');
            // 跳转到首页
            res.redirect('/posts');
        })
        .catch(function (e) {
            // 注册失败，异步删除上传的头像
            fs.unlink(req.files.avatar.path);
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '用户名已被占用');
                return res.redirect('/signup');
            }
            next(e);
        });
});

module.exports= router;