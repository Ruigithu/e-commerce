package com.ruipeng.e_commrce.service_user.config.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.session.SessionManagementFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private AppUserDetailsService userDetailsService;
    private AppAuthenticationFailureHandler failureHandler;
    private AppLogoutHandler logoutHandler;
    private  CorsFilter corsFilter;
    private  CorsConfiguration corsConfiguration;

    @Autowired
    public SecurityConfig(AppUserDetailsService userDetailsService, AppAuthenticationFailureHandler failureHandler, AppLogoutHandler logoutHandler, CorsFilter corsFilter, CorsConfiguration corsConfiguration) {
        this.userDetailsService = userDetailsService;
        this.failureHandler = failureHandler;
        this.logoutHandler = logoutHandler;
        this.corsFilter = corsFilter;
        this.corsConfiguration = corsConfiguration;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http. cors(cors -> cors.configurationSource(request -> corsConfiguration))
                .csrf(csrf -> csrf.disable())
                .addFilterBefore(corsFilter, SessionManagementFilter.class)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/signup",
                                "/login",
                                "/auth/**",    // 添加认证相关的API路径
                                "/css/**",
                                "/js/**",
                                "/h2-console/**"
                                )
                        .permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/**").permitAll()
                        .anyRequest()
                        .authenticated()
                )
                .formLogin(form -> form.disable())  // 禁用默认的表单登录
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(logoutHandler)
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                );

        return http.build();
    }

    @Bean
    //AuthenticationConfiguration will collect Provider automatically,included the one we registered
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider providerManager() throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(getPasswordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder(16);
    }

}
