package com.ruipeng.e_commrce.service_user.controller;

import com.ruipeng.e_commrce.service_user.entity.User;
import com.ruipeng.e_commrce.service_user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class UserController {

   private UserService service;
   private AuthenticationManager authenticationManager;

    @Autowired
   public UserController(UserService service,AuthenticationManager authenticationManager) {
        this.service = service;
        this.authenticationManager = authenticationManager;
   }

    @PostMapping("/signup")
    public User signup(@RequestBody User user) {
       user.setUserId(UUID.randomUUID());
        user.setCreateAt(LocalDateTime.now());
        user.setUpdateAt(LocalDateTime.now());
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(16);
        user.setPassword(encoder.encode(user.getPassword()));
        return service.register(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        System.out.println("进入配置的login:"+user.getUsername());
        // 自定义登录逻辑，例如验证用户信息
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );
        if (authentication.isAuthenticated()) {
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HashMap<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());

            return ResponseEntity.ok(response);
        }


        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid username or password"));
    }
}

