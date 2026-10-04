const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve criar um usuário maior de idade com status ativo', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario).toMatchObject({ nome, email, idade, status: 'ativo' });
    });

    test('deve gerar um id para o usuário criado', () => {
      // Arrange
      const nome = 'Fulano de Tal';

      // Act
      const usuario = userService.createUser(nome, 'fulano@teste.com', 25);

      // Assert
      expect(usuario.id).toEqual(expect.any(String));
    });

    test('deve criar o usuário como não administrador por padrão', () => {
      // Act
      const usuario = userService.createUser('Comum', 'comum@teste.com', 30);

      // Assert
      expect(usuario.isAdmin).toBe(false);
    });

    test('deve marcar o usuário como administrador quando isAdmin for true', () => {
      // Act
      const usuario = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Assert
      expect(usuario.isAdmin).toBe(true);
    });

    test('deve aceitar um usuário com exatamente 18 anos', () => {
      // Act
      const usuario = userService.createUser('Jovem', 'jovem@teste.com', 18);

      // Assert
      expect(usuario.idade).toBe(18);
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      // Arrange
      const criarMenor = () => userService.createUser('Menor', 'menor@email.com', 17);

      // Act & Assert
      expect(criarMenor).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve lançar erro quando o email não for informado', () => {
      // Arrange
      const criarSemEmail = () => userService.createUser('Sem Email', '', 25);

      // Act & Assert
      expect(criarSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário criado ao buscar pelo seu id', () => {
      // Arrange
      const usuarioCriado = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('deve retornar null quando o id não existir', () => {
      // Act
      const usuario = userService.getUserById('id-inexistente');

      // Assert
      expect(usuario).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve retornar true ao desativar um usuário comum', () => {
      // Arrange
      const usuario = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuario.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('deve alterar o status do usuário comum para inativo', () => {
      // Arrange
      const usuario = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      userService.deactivateUser(usuario.id);

      // Assert
      expect(userService.getUserById(usuario.id).status).toBe('inativo');
    });

    test('deve retornar false ao tentar desativar um administrador', () => {
      // Arrange
      const admin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(admin.id);

      // Assert
      expect(resultado).toBe(false);
    });

    test('deve manter o administrador ativo após a tentativa de desativação', () => {
      // Arrange
      const admin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      userService.deactivateUser(admin.id);

      // Assert
      expect(userService.getUserById(admin.id).status).toBe('ativo');
    });

    test('deve retornar false ao desativar um id inexistente', () => {
      // Act
      const resultado = userService.deactivateUser('id-inexistente');

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir id, nome e status do usuário no relatório', () => {
      // Arrange
      const alice = userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(alice.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('ativo');
    });

    test('deve listar todos os usuários cadastrados no relatório', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('Bob');
    });

    test('deve informar que não há usuários quando o banco estiver vazio', () => {
      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });
  });
});
