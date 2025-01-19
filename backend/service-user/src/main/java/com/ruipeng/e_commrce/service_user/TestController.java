package com.ruipeng.e_commrce.service_user;

import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")  // 这个路径要和网关配置匹配
public class TestController {
    // 你的控制器方法...
    @GetMapping("test")
    public String test(){
        return "test";
    }
}
