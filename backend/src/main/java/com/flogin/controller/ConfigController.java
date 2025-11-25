package com.flogin.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ConfigController {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @GetMapping("/config")
    public Map<String, String> getConfig() {
        return Map.of(
            "frontendUrl", frontendUrl,
            "apiBase", contextPath
        );
    }
}