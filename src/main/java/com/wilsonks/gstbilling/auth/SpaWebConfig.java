package com.wilsonks.gstbilling.auth;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {

        registry.addViewController("/")
                .setViewName("forward:/index.html");

        registry.addViewController("/dashboard")
                .setViewName("forward:/index.html");

        registry.addViewController("/login")
                .setViewName("forward:/index.html");

        registry.addViewController("/register")
                .setViewName("forward:/index.html");

        registry.addViewController("/admin")
                .setViewName("forward:/index.html");

        registry.addViewController("/admin/**")
                .setViewName("forward:/index.html");

//        registry.addViewController("/{spring:^(?!api).*$}")
//                .setViewName("forward:/index.html");
//
//        registry.addViewController("/**/{spring:^(?!api).*$}")
//                .setViewName("forward:/index.html");
//
//        registry.addViewController("/{spring:^(?!api).*$}/**{spring:?!(\\.js|\\.css)$}")
//                .setViewName("forward:/index.html");

    }
}