//package br.com.halotec.hungospring.security;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.Customizer;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.logout.HeaderWriterLogoutHandler;
//import org.springframework.security.web.header.writers.ClearSiteDataHeaderWriter;
//import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.List;
//
//import static br.com.halotec.hungospring.security.UrlPatternConfig.PRIVATE_MATCHERS;
//import static br.com.halotec.hungospring.security.UrlPatternConfig.PUBLIC_MATCHERS;
//import static org.springframework.security.config.Customizer.withDefaults;
//import static org.springframework.security.web.header.writers.ClearSiteDataHeaderWriter.Directive.COOKIES;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http.authorizeHttpRequests(authConfig -> {
//            authConfig.requestMatchers(PUBLIC_MATCHERS).permitAll();
//            //authConfig.requestMatchers(PRIVATE_MATCHERS).authenticated();
//            //authConfig.anyRequest().authenticated();
//        });
//        /*http.formLogin(login -> {
//            login.loginPage("/login");
//            login.defaultSuccessUrl("/", true);
//            //login.failureUrl("/login-error");
//        });
//        http.logout(logout -> {
//            logout.logoutRequestMatcher(new AntPathRequestMatcher("/logout"));
//            logout.logoutSuccessUrl("/login");
//            logout.permitAll();
//            logout.addLogoutHandler(new HeaderWriterLogoutHandler(new ClearSiteDataHeaderWriter(COOKIES)));
//            logout.invalidateHttpSession(true);
//        });*/
//        http.csrf(Customizer.withDefaults());
//        http.httpBasic(withDefaults());
//        http.sessionManagement(session -> {
//            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
//        });
//        return http.build();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration().applyPermitDefaultValues();
//        //configuration.setAllowedOrigins(List.of("http://localhost:5173"));
//        configuration.setAllowedMethods(List.of("POST", "GET", "PUT", "DELETE", "OPTIONS"));
//        configuration.setAllowCredentials(true);
//        configuration.addAllowedHeader("*");
//        configuration.addExposedHeader("Authorization");
//        configuration.addExposedHeader("Content-Type");
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//
//        return source;
//    }
//
//    @Bean
//    public UserDetailsService userDetailsService(){
//        return null;
//    }
//}
