package com.ruipeng.e_commrce.service_user.service;

import com.ruipeng.e_commrce.service_user.entity.User;
import com.ruipeng.e_commrce.service_user.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private UserRepo repo;

    @Autowired
    public UserService(UserRepo repo) {
        this.repo = repo;
    }

    public User register(User user) {
        User u = repo.findByEmail(user.getEmail());
        if (u == null) {
            return repo.save(user);
        }else {
            return null;
        }
    }
}
