package com.ruipeng.e_commrce.service_user.config.security;

import com.ruipeng.e_commrce.service_user.entity.User;
import com.ruipeng.e_commrce.service_user.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {


    private  UserRepo repo;

    @Autowired
    public AppUserDetailsService(UserRepo repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("loadByUsername: "+username);
        User user = repo.findByUsername(username);
        if (user == null) {
            System.out.println("user not found");
            throw new UsernameNotFoundException(username);
        }else {
            return new AppUserDetails(user);
        }
    }
}
