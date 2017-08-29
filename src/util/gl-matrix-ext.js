import {mat2d} from 'gl-matrix';

var ext = {};
ext.multiplyPoint = function multiplyPoint(m, p) {
    return [
        m[0] * p[0] + m[1] * p[1] + m[4],
        m[2] * p[0] + m[3] * p[1] + m[5]
    ];
}

ext.scaleAt=function scaleAt(point,xy){
    var sc=mat2d.fromScaling([],xy);
    var t1=mat2d.fromTranslation([],[-point[0],-point[1]]);
    var t2=mat2d.fromTranslation([],[point[0],point[1]]);
    var nx=mat2d.mul([],t2,sc);
    var nxx=mat2d.mul([],nx,t1);
    return nxx;
}
ext.applyMatrix=function applyMatrix(s,t){
    return mat2d.mul([],t,s);
}
ext.applyRightMatrix=function applyRightMatrix(s,t){
    return mat2d.mul([],s,t);
}
export default ext;