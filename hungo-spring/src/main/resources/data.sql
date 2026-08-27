-- CATEGORIAS
INSERT IGNORE INTO Categoria (id, nome) VALUES (1, 'Hambúrgueres Artesanais');
INSERT IGNORE INTO Categoria (id, nome) VALUES (2, 'Pizzas Especiais');
INSERT IGNORE INTO Categoria (id, nome) VALUES (3, 'Porções & Petiscos');
INSERT IGNORE INTO Categoria (id, nome) VALUES (4, 'Bebidas & Sucos');
INSERT IGNORE INTO Categoria (id, nome) VALUES (5, 'Sobremesas');
INSERT IGNORE INTO Categoria (id, nome) VALUES (6, 'Geral');

-- PRODUTOS (30 PRODUTOS - 12 FAVORITOS)
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (1, 'X-Bacon Supremo 180g', 34.90, true, true, 1);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (2, 'Smash Cheddar Duplo', 29.90, true, true, 1);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (3, 'Pizza Calabresa Especial 35cm', 49.90, true, true, 2);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (4, 'Batata Frita c/ Cheddar e Bacon 500g', 38.00, true, true, 3);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (5, 'Coca-Cola Original 350ml', 7.50, true, true, 4);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (6, 'Suco Natural de Morango 500ml', 12.00, true, true, 4);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (7, 'X-Salada Clássico', 26.90, true, true, 1);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (8, 'Burger Vegetariano Grão de Bico', 31.00, true, true, 1);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (9, 'Monster Burger 360g Duplo', 42.90, true, true, 1);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (10, 'Chicken Crispy Burger', 28.50, true, true, 1);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (11, 'X-Tudo da Casa Completo', 39.90, true, true, 1);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (12, 'Smash Egg & Bacon', 27.90, true, true, 1);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (13, 'Pizza Muçarela Tradicional 35cm', 42.00, true, false, 2);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (14, 'Pizza Frango c/ Catupiry 35cm', 52.90, true, false, 2);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (15, 'Pizza Quatro Queijos Gourmet 35cm', 55.00, true, false, 2);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (16, 'Pizza Portuguesa Completa 35cm', 54.00, true, false, 2);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (17, 'Pizza Marguerita c/ Manjericão 35cm', 46.00, true, false, 2);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (18, 'Isca de Frango Empanado 400g', 35.00, true, false, 3);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (19, 'Anéis de Cebola Empanados 300g', 28.00, true, false, 3);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (20, 'Pastéis Sortidos Gourmet 10un', 32.00, true, false, 3);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (21, 'Guaraná Antarctica Lata 350ml', 7.50, true, false, 4);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (22, 'Cerveja Cerpa Export Long Neck 355ml', 11.00, true, false, 4);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (23, 'Cerveja Heineken Long Neck 330ml', 13.50, true, false, 4);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (24, 'Água Mineral Sem Gás 500ml', 4.50, true, false, 4);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (25, 'Suco de Laranja Integral 500ml', 10.00, true, false, 4);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (26, 'Soda Italiana Maçã Verde 400ml', 14.00, true, false, 4);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (27, 'Grand Gateau Chocolate c/ Sorvete', 26.00, true, false, 5);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (28, 'Pudim de Leite Condensado Caseiro', 12.00, true, false, 5);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (29, 'Torta Holandesa Fatia Especial', 16.50, true, false, 5);
INSERT IGNORE INTO Produto (id, nome, preco, tipo, favorito, categoria_id) VALUES (30, 'Café Expresso c/ Petit Four', 9.90, true, false, 6);

UPDATE Produto SET favorito = true WHERE id BETWEEN 1 AND 12;

-- CLIENTES
INSERT IGNORE INTO Cliente (id, nome, telefone, email, cpf, dataCadastro, status) VALUES (1, 'João Carlos da Silva', '(11) 98888-7777', 'joao.silva@email.com', '123.456.789-01', NOW(), true);
INSERT IGNORE INTO Cliente (id, nome, telefone, email, cpf, dataCadastro, status) VALUES (2, 'Maria Eduarda Santos', '(11) 97777-6666', 'maria.santos@email.com', '234.567.890-12', NOW(), true);
INSERT IGNORE INTO Cliente (id, nome, telefone, email, cpf, dataCadastro, status) VALUES (3, 'Carlos Eduardo Oliveira', '(11) 96666-5555', 'carlos.oliveira@email.com', '345.678.901-23', NOW(), true);
INSERT IGNORE INTO Cliente (id, nome, telefone, email, cpf, dataCadastro, status) VALUES (4, 'Fernanda Lima Alencar', '(11) 95555-4444', 'fernanda.lima@email.com', '456.789.012-34', NOW(), true);
INSERT IGNORE INTO Cliente (id, nome, telefone, email, cpf, dataCadastro, status) VALUES (5, 'Lucas Gabriel Souza', '(11) 94444-3333', 'lucas.souza@email.com', '567.890.123-45', NOW(), true);
INSERT IGNORE INTO Cliente (id, nome, telefone, email, cpf, dataCadastro, status) VALUES (6, 'Beatriz Mendes Ferreira', '(11) 93333-2222', 'beatriz.mendes@email.com', '678.901.234-56', NOW(), true);
INSERT IGNORE INTO Cliente (id, nome, telefone, email, cpf, dataCadastro, status) VALUES (7, 'Pedro Henrique Ribeiro', '(11) 92222-1111', 'pedro.ribeiro@email.com', '789.012.345-67', NOW(), true);
INSERT IGNORE INTO Cliente (id, nome, telefone, email, cpf, dataCadastro, status) VALUES (8, 'Ana Clara Costa', '(11) 91111-0000', 'ana.costa@email.com', '890.123.456-78', NOW(), true);

-- ENDEREÇOS
INSERT IGNORE INTO Endereco (id, rua, numero, complemento, bairro, cidade, cep, cliente_id) VALUES (1, 'Avenida Paulista', 1000, 'Apto 42', 'Bela Vista', 'São Paulo', '01310-100', 1);
INSERT IGNORE INTO Endereco (id, rua, numero, complemento, bairro, cidade, cep, cliente_id) VALUES (2, 'Rua dos Pinheiros', 450, 'Casa 2', 'Pinheiros', 'São Paulo', '05422-000', 2);
INSERT IGNORE INTO Endereco (id, rua, numero, complemento, bairro, cidade, cep, cliente_id) VALUES (3, 'Alameda Santos', 850, 'Bloco B, Ap 12', 'Jardins', 'São Paulo', '01418-002', 3);
INSERT IGNORE INTO Endereco (id, rua, numero, complemento, bairro, cidade, cep, cliente_id) VALUES (4, 'Rua Augusta', 1200, 'Apto 101', 'Consolação', 'São Paulo', '01304-001', 4);

-- MESAS FÍSICAS
INSERT IGNORE INTO Mesa (id, nome, status) VALUES (1, 'Mesa 01', true);
INSERT IGNORE INTO Mesa (id, nome, status) VALUES (2, 'Mesa 02', true);
INSERT IGNORE INTO Mesa (id, nome, status) VALUES (3, 'Mesa 03', true);
INSERT IGNORE INTO Mesa (id, nome, status) VALUES (4, 'Mesa 04', true);
INSERT IGNORE INTO Mesa (id, nome, status) VALUES (5, 'Mesa 05', true);
INSERT IGNORE INTO Mesa (id, nome, status) VALUES (6, 'Mesa VIP Sacada', true);
INSERT IGNORE INTO Mesa (id, nome, status) VALUES (7, 'Mesa Família 01', true);
