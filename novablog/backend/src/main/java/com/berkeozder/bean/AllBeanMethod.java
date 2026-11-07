package com.berkeozder.bean;

public abstract class AllBeanMethod {

    // Bean oluşturulduğunda çalışacak metot
    public abstract void onInit();

    // Bean yok edilmeden hemen önce çalışacak metot
    public abstract void onDestory();
}
