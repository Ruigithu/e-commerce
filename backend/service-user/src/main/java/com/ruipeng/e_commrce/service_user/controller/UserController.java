package com.ruipeng.e_commrce.service_user.controller;

import com.ruipeng.e_commrce.service_user.config.security.AppUserDetails;
import com.ruipeng.e_commrce.service_user.entity.Address;
import com.ruipeng.e_commrce.service_user.entity.User;
import com.ruipeng.e_commrce.service_user.repo.UserRepo;
import com.ruipeng.e_commrce.service_user.service.AddressService;
import com.ruipeng.e_commrce.service_user.service.MerchantService;
import com.ruipeng.e_commrce.service_user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
public class UserController {

    private final UserService userService;
    private final UserRepo userRepo;
    private UserService service;
   private MerchantService merchantService;
   private AuthenticationManager authenticationManager;
   private UserDetailsService userDetailsService;
   private AddressService addressService;;

    @Autowired
   public UserController(UserService service, MerchantService merchantService, AuthenticationManager authenticationManager, UserDetailsService userDetailsService, AddressService addressService, UserService userService, UserRepo userRepo) {
        this.service = service;
        this.merchantService = merchantService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.addressService = addressService;
        this.userService = userService;
        this.userRepo = userRepo;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody User user) {
       user.setUserId(UUID.randomUUID());
        user.setCreateAt(LocalDateTime.now());
        user.setUpdateAt(LocalDateTime.now());
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(16);
        user.setPassword(encoder.encode(user.getPassword()));
        return ResponseEntity.ok(service.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );

            if (authentication.isAuthenticated()) {
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // 从 AppUserDetails 中获取 User 对象
                AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
                User authenticatedUser = userDetails.getUser();  // 添加 getUser() 方法到 AppUserDetails


                Address address = addressService.getDefaultAddressByUserId(authenticatedUser.getUserId());
                HashMap<String, Object> response = new HashMap<>();
                System.out.println("userId: " + authenticatedUser.getUserId());
                System.out.println("userName: " + authenticatedUser.getUsername()); // 确保 username 不是 null
                response.put("userId", authenticatedUser.getUserId());
                response.put("userName", authenticatedUser.getUsername());
                response.put("isMerchant", authenticatedUser.getIsMerchant());

                response.put("defaultAddress", address);




                return ResponseEntity.ok(response);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication failed"));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/findUserById")
    public Optional<User> findUserById(@RequestParam("userId") UUID userId) {
       return userRepo.findById(userId);
    }
}

