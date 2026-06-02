package com.wilsonks.gstbilling;


import com.wilsonks.gstbilling.exception.NotFoundException;
import com.wilsonks.gstbilling.auth.identity.User;
import com.wilsonks.gstbilling.auth.identity.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws NotFoundException {

        User user = repo.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                        .toList()
        );
    }
}
