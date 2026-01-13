/**
 * Plugin management helpers for E2E tests
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const execAsync = promisify(exec);
const wpSitePath = process.env.WORDPRESS_PATH;

/**
 * Execute WordPress PHP code
 * @param {string} phpCode - PHP code to execute
 */
async function execWP(phpCode) {
  return execAsync(
    `php -r "require_once('${wpSitePath}/wp-load.php'); ${phpCode}"`,
    { cwd: __dirname }
  );
}

/**
 * Install and activate a plugin from wordpress.org
 * @param {string} slug - Plugin slug
 */
async function installPlugin(slug) {
  console.log(`📦 Installing plugin: ${slug}...`);

  await execAsync(
    `cd ${wpSitePath} && wp plugin install ${slug} --activate --allow-root 2>&1`,
    { cwd: __dirname }
  );

  console.log(`   Verifying activation...`);
  const { stdout } = await execWP(
    `echo is_plugin_active('${slug}/${slug}.php') ? '1' : '0';`
  );

  if (stdout.trim() !== '1') {
    throw new Error(`Plugin ${slug} failed to activate`);
  }

  console.log(`✅ ${slug} installed and active`);
}

/**
 * Uninstall a plugin
 * @param {string} slug - Plugin slug
 */
async function uninstallPlugin(slug) {
  console.log(`🗑️ Uninstalling plugin: ${slug}...`);
  await execAsync(
    `cd ${wpSitePath} && wp plugin deactivate ${slug} --allow-root 2>&1 || true`,
    { cwd: __dirname }
  );
  await execAsync(
    `cd ${wpSitePath} && wp plugin uninstall ${slug} --allow-root 2>&1 || true`,
    { cwd: __dirname }
  );
  console.log(`✅ ${slug} uninstalled`);
}

/**
 * Deactivate the Facebook for WooCommerce plugin
 */
async function deactivatePlugin() {
  console.log('🔌 Deactivating plugin...');
  await execWP(`deactivate_plugins('facebook-for-woocommerce/facebook-for-woocommerce.php');`);
  console.log('✅ Plugin deactivated');
}

/**
 * Activate the Facebook for WooCommerce plugin
 */
async function activatePlugin() {
  console.log('🔌 Activating plugin...');
  await execWP(`activate_plugins('facebook-for-woocommerce/facebook-for-woocommerce.php');`);
  console.log('✅ Plugin activated');
}

/**
 * Install mu-plugin that disables pixel tracking
 */
async function installPixelBlockerMuPlugin() {
  console.log('🔧 Installing pixel blocker mu-plugin...');
  const muPluginDir = `${wpSitePath}/wp-content/mu-plugins`;
  const muPluginFile = `${muPluginDir}/e2e-pixel-blocker.php`;
  const code = `<?php\nadd_filter('facebook_for_woocommerce_integration_pixel_enabled', '__return_false', 999);\n`;

  console.log(`   Creating dir: ${muPluginDir}`);
  fs.mkdirSync(muPluginDir, { recursive: true });

  console.log(`   Writing: ${muPluginFile}`);
  fs.writeFileSync(muPluginFile, code);

  console.log('✅ Pixel blocker mu-plugin installed');
}

/**
 * Remove the pixel blocker mu-plugin
 */
async function removePixelBlockerMuPlugin() {
  console.log('🧹 Removing pixel blocker mu-plugin...');
  const muPluginFile = `${wpSitePath}/wp-content/mu-plugins/e2e-pixel-blocker.php`;

  if (fs.existsSync(muPluginFile)) {
    fs.unlinkSync(muPluginFile);
  }
  console.log('✅ Pixel blocker mu-plugin removed');
}

module.exports = {
  installPlugin,
  uninstallPlugin,
  deactivatePlugin,
  activatePlugin,
  installPixelBlockerMuPlugin,
  removePixelBlockerMuPlugin
};
