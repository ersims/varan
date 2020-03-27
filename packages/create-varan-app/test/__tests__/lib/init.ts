import execa from 'execa';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import init from '../../../src/lib/init';

// Mocks
jest.mock('execa', () => jest.fn(() => ({})));

// Setup
beforeEach(jest.resetAllMocks);

// Tests
it('should clone the advanced boilerplate by default', async (done) => {
  expect.assertions(7);
  const orgChdir = process.chdir;
  process.chdir = jest.fn();
  const name = 'test-project';
  const appDir = os.tmpdir();
  const targetDir = path.resolve(appDir, name);
  const boilerplateGitRepo = 'https://github.com/ersims/varan-boilerplate.git';
  const out = await init({ appDir, name });

  /**
   * Assertions
   */
  expect(execa).toHaveBeenCalledTimes(3);
  expect(process.chdir).toHaveBeenCalledTimes(1);

  // First clone the repo
  expect(execa).toHaveBeenNthCalledWith(1, 'git', [
    'clone',
    '--quiet',
    '--origin=upstream',
    boilerplateGitRepo,
    targetDir,
  ]);

  // Change working directory
  expect(process.chdir).toHaveBeenCalledWith(targetDir);

  // Remove origin remote
  expect(execa).toHaveBeenNthCalledWith(2, 'git', ['branch', '--unset-upstream']);

  // Install dependencies
  expect(execa).toHaveBeenNthCalledWith(3, 'npm', ['install']);

  // Return the project details
  expect(out).toEqual(
    expect.objectContaining({
      appDir: targetDir,
      appName: name,
      context: expect.objectContaining({}),
      tasks: expect.objectContaining({
        _options: expect.objectContaining({
          renderer: 'silent',
          nonTTYRenderer: 'silent',
        }),
      }),
    }),
  );

  // Cleanup
  process.chdir = orgChdir;

  // Done
  done();
});
it('should respect `opts.fromGitRepo`', async (done) => {
  expect.assertions(1);
  const orgChdir = process.chdir;
  process.chdir = jest.fn();
  const name = 'test-project';
  const appDir = os.tmpdir();
  const targetDir = path.resolve(appDir, name);
  const fromGitRepo = 'https://github.com/ersims/varan.git';
  await init({ appDir, name, fromGitRepo });

  /**
   * Assertions
   */
  // First clone the repo
  expect(execa).toHaveBeenNthCalledWith(1, 'git', ['clone', '--quiet', '--origin=upstream', fromGitRepo, targetDir]);

  // Cleanup
  process.chdir = orgChdir;

  // Done
  done();
});
it('should respect `opts.verbose`', async (done) => {
  expect.assertions(1);
  const orgChdir = process.chdir;
  process.chdir = jest.fn();
  const name = 'test-project';
  const appDir = os.tmpdir();
  const { tasks } = await init({ appDir, name, verbose: true });

  /**
   * Assertions
   */
  expect(tasks).toEqual(
    expect.objectContaining({
      _options: expect.objectContaining({
        renderer: 'default',
        nonTTYRenderer: 'verbose',
      }),
    }),
  );

  // Cleanup
  process.chdir = orgChdir;

  // Done
  done();
});
it('should reject invalid project names', async (done) => {
  expect.assertions(4);
  const appDir = os.tmpdir();

  /**
   * Assertions
   */
  await expect(init({ appDir, name: 'invalidProjectName' })).rejects.toThrowError(
    'Project name can no longer contain capital letters',
  );
  await expect(init({ appDir, name: 'invalid project name' })).rejects.toThrowError(
    'Project name can only contain URL-friendly characters',
  );
  await expect(init({ appDir, name: '_invalid-project-name' })).rejects.toThrowError(
    'Project name cannot start with an underscore',
  );
  await expect(init({ appDir, name: '' })).rejects.toThrowError('Project name length must be greater than zero');

  // Done
  done();
});
it('should reject creating a project if it already exists', async (done) => {
  expect.assertions(2);
  const orgExistsSync = fs.existsSync;
  fs.existsSync = jest.fn(() => true);
  const name = 'test-project';
  const appDir = os.tmpdir();
  const targetDir = path.resolve(appDir, name);

  /**
   * Assertions
   */
  await expect(init({ appDir, name })).rejects.toThrowError('Something already exists at');
  expect(fs.existsSync).toBeCalledWith(targetDir);

  // Cleanup
  fs.existsSync = orgExistsSync;

  // Done
  done();
});
it('should give useful feedback if git clone fails', async (done) => {
  expect.assertions(1);
  const name = 'test-project';
  const appDir = os.tmpdir();

  // Force a git failure once
  ((execa as unknown) as jest.Mock).mockImplementation((cmd: string) => {
    if (cmd === 'git') throw new Error('Mocked error');
    return {};
  });

  /**
   * Assertions
   */
  await expect(init({ appDir, name })).rejects.toThrowError(
    'Failed to clone from git repo https://github.com/ersims/varan-boilerplate.git. Make sure you have git (https://git-scm.com/) installed, the remote repository exists, you have the necessary permissions and internet connectivity.',
  );

  // Cleanup
  ((execa as unknown) as jest.Mock).mockReset();

  // Done
  done();
});
it('should fail if git fails to remove connection to origin remote', async (done) => {
  expect.assertions(1);
  const orgChdir = process.chdir;
  process.chdir = jest.fn();
  const name = 'test-project';
  const appDir = os.tmpdir();

  // Force a git failure once
  ((execa as unknown) as jest.Mock).mockImplementation((cmd: string, args: string[]) => {
    if (cmd === 'git' && args[0] === 'branch') throw new Error('Mocked error');
    return {};
  });

  /**
   * Assertions
   */
  await expect(init({ appDir, name })).rejects.toThrowError('Failed to prepare git repo');

  // Cleanup
  ((execa as unknown) as jest.Mock).mockReset();
  process.chdir = orgChdir;

  // Done
  done();
});
