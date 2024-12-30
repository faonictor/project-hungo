package br.com.halotec.hungospring.security;

public class UrlPatternConfig {
    public static final String[] PUBLIC_MATCHERS = {
            "/categoria/**",
            "/cliente-endereco",
            "/cliente/**",
            "/endereco/**",
            "/fluxo/**",
            "/funcionario/**",
            "/insumo/**",
            "/item-pedido/**",
            "/mesa/**",
            "/pedido/**",
            "/produtos",
            "/produto/**",
            "/produto-insumo/**",
            "venda/**",

    };

    public static final String[] PRIVATE_MATCHERS = {
            "/",
            "/systemUser-management/**",
            "/basicHealthUnit-management/**",
            "/patient-management/**",
            "/patient-list/**",
            "/appointment-management/**",
            "/specialty-management/**",
            "/medicalSlot-management/**",
            "/contemplation-management/**",
            "/queue-management/**",
    };
}
