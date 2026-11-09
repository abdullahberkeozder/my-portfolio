package com.berkeozder.bean;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperBean {

    private final ModelMapper modelMapper = new ModelMapper();

    @Bean(name = "modelMapper")
    public ModelMapper modelMapperMethod() {
        return modelMapper;
    }
}
