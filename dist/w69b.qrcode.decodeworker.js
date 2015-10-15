self.CLOSURE_NO_DEPS = true;
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 * @author arv@google.com (Erik Arvidsson)
 *
 * @provideGoog
 */


/**
 * @define {boolean} Overridden to true by the compiler when
 *     --process_closure_primitives is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is already
 * defined in the current scope before assigning to prevent clobbering if
 * base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {};


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * A hook for overriding the define values in uncompiled mode.
 *
 * In uncompiled mode, {@code CLOSURE_UNCOMPILED_DEFINES} may be defined before
 * loading base.js.  If a key is defined in {@code CLOSURE_UNCOMPILED_DEFINES},
 * {@code goog.define} will use the value instead of the default value.  This
 * allows flags to be overwritten without compilation (this is normally
 * accomplished with the compiler's "define" flag).
 *
 * Example:
 * <pre>
 *   var CLOSURE_UNCOMPILED_DEFINES = {'goog.DEBUG': false};
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_UNCOMPILED_DEFINES;


/**
 * A hook for overriding the define values in uncompiled or compiled mode,
 * like CLOSURE_UNCOMPILED_DEFINES but effective in compiled code.  In
 * uncompiled code CLOSURE_UNCOMPILED_DEFINES takes precedence.
 *
 * Also unlike CLOSURE_UNCOMPILED_DEFINES the values must be number, boolean or
 * string literals or the compiler will emit an error.
 *
 * While any @define value may be set, only those set with goog.define will be
 * effective for uncompiled code.
 *
 * Example:
 * <pre>
 *   var CLOSURE_DEFINES = {'goog.DEBUG': false} ;
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_DEFINES;


/**
 * Returns true if the specified value is not undefined.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  // void 0 always evaluates to undefined and hence we do not need to depend on
  // the definition of the global variable named 'undefined'.
  return val !== void 0;
};


/**
 * Builds an object structure for the provided namespace path, ensuring that
 * names that already exist are not overwritten. For example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Defines a named value. In uncompiled mode, the value is retrieved from
 * CLOSURE_DEFINES or CLOSURE_UNCOMPILED_DEFINES if the object is defined and
 * has the property specified, and otherwise used the defined defaultValue.
 * When compiled the default can be overridden using the compiler
 * options or the value set in the CLOSURE_DEFINES object.
 *
 * @param {string} name The distinguished name to provide.
 * @param {string|number|boolean} defaultValue
 */
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_UNCOMPILED_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_UNCOMPILED_DEFINES, name)) {
      value = goog.global.CLOSURE_UNCOMPILED_DEFINES[name];
    } else if (goog.global.CLOSURE_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name];
    }
  }
  goog.exportPath_(name, value);
};


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.define('goog.DEBUG', true);


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.define('goog.LOCALE', 'en');  // default to en


/**
 * @define {boolean} Whether this code is running on trusted sites.
 *
 * On untrusted sites, several native functions can be defined or overridden by
 * external libraries like Prototype, Datejs, and JQuery and setting this flag
 * to false forces closure to use its own implementations when possible.
 *
 * If your JavaScript can be loaded by a third party site and you are wary about
 * relying on non-standard implementations, specify
 * "--define goog.TRUSTED_SITE=false" to the JSCompiler.
 */
goog.define('goog.TRUSTED_SITE', true);


/**
 * @define {boolean} Whether a project is expected to be running in strict mode.
 *
 * This define can be used to trigger alternate implementations compatible with
 * running in EcmaScript Strict mode or warn about unavailable functionality.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
 *
 */
goog.define('goog.STRICT_MODE_COMPATIBLE', false);


/**
 * @define {boolean} Whether code that calls {@link goog.setTestOnly} should
 *     be disallowed in the compilation unit.
 */
goog.define('goog.DISALLOW_TEST_ONLY_CODE', COMPILED && !goog.DEBUG);


/**
 * @define {boolean} Whether to use a Chrome app CSP-compliant method for
 *     loading scripts via goog.require. @see appendScriptSrcNode_.
 */
goog.define('goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING', false);


/**
 * Defines a namespace in Closure.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * The presence of one or more goog.provide() calls in a file indicates
 * that the file defines the given objects/namespaces.
 * Provided symbols must not be null or undefined.
 *
 * In addition, goog.provide() creates the object stubs for a namespace
 * (for example, goog.provide("goog.foo.bar") will create the object
 * goog.foo.bar if it does not already exist).
 *
 * Build tools also scan for provide/require/module statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 *
 * @see goog.require
 * @see goog.module
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
  }

  goog.constructNamespace_(name);
};


/**
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 * @param {Object=} opt_obj The object to embed in the namespace.
 * @private
 */
goog.constructNamespace_ = function(name, opt_obj) {
  if (!COMPILED) {
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name, opt_obj);
};


/**
 * Module identifier validation regexp.
 * Note: This is a conservative check, it is very possible to be more lenient,
 *   the primary exclusion here is "/" and "\" and a leading ".", these
 *   restrictions are intended to leave the door open for using goog.require
 *   with relative file paths rather than module identifiers.
 * @private
 */
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;


/**
 * Defines a module in Closure.
 *
 * Marks that this file must be loaded as a module and claims the namespace.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * goog.module() has three requirements:
 * - goog.module may not be used in the same file as goog.provide.
 * - goog.module must be the first statement in the file.
 * - only one goog.module is allowed per file.
 *
 * When a goog.module annotated file is loaded, it is enclosed in
 * a strict function closure. This means that:
 * - any variables declared in a goog.module file are private to the file
 * (not global), though the compiler is expected to inline the module.
 * - The code must obey all the rules of "strict" JavaScript.
 * - the file will be marked as "use strict"
 *
 * NOTE: unlike goog.provide, goog.module does not declare any symbols by
 * itself. If declared symbols are desired, use
 * goog.module.declareLegacyNamespace().
 *
 *
 * See the public goog.module proposal: http://goo.gl/Va1hin
 *
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part", is expected but not required.
 */
goog.module = function(name) {
  if (!goog.isString(name) ||
      !name ||
      name.search(goog.VALID_MODULE_RE_) == -1) {
    throw Error('Invalid module identifier');
  }
  if (!goog.isInModuleLoader_()) {
    throw Error('Module ' + name + ' has been loaded incorrectly.');
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw Error('goog.module may only be called once per module.');
  }

  // Store the module name for the loader.
  goog.moduleLoaderState_.moduleName = name;
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
  }
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 *
 * Note: This is not an alternative to goog.require, it does not
 * indicate a hard dependency, instead it is used to indicate
 * an optional dependency or to access the exports of a module
 * that has already been loaded.
 * @suppress {missingProvide}
 */
goog.module.get = function(name) {
  return goog.module.getInternal_(name);
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 * @private
 */
goog.module.getInternal_ = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      // goog.require only return a value with-in goog.module files.
      return name in goog.loadedModules_ ?
          goog.loadedModules_[name] :
          goog.getObjectByName(name);
    } else {
      return null;
    }
  }
};


/**
 * @private {?{moduleName: (string|undefined)}}
 */
goog.moduleLoaderState_ = null;


/**
 * @private
 * @return {boolean} Whether a goog.module is currently being initialized.
 */
goog.isInModuleLoader_ = function() {
  return goog.moduleLoaderState_ != null;
};


/**
 * Provide the module's exports as a globally accessible object under the
 * module's declared name.  This is intended to ease migration to goog.module
 * for files that have existing usages.
 * @suppress {missingProvide}
 */
goog.module.declareLegacyNamespace = function() {
  if (!COMPILED && !goog.isInModuleLoader_()) {
    throw new Error('goog.module.declareLegacyNamespace must be called from ' +
        'within a goog.module');
  }
  if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
    throw Error('goog.module must be called prior to ' +
        'goog.module.declareLegacyNamespace.');
  }
  goog.moduleLoaderState_.declareLegacyNamespace = true;
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 *
 * In the case of unit tests, the message may optionally be an exact namespace
 * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
 * provide (if not explicitly defined in the code).
 *
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                (opt_message ? ': ' + opt_message : '.'));
  }
};


/**
 * Forward declares a symbol. This is an indication to the compiler that the
 * symbol may be used in the source yet is not required and may not be provided
 * in compilation.
 *
 * The most common usage of forward declaration is code that takes a type as a
 * function parameter but does not need to require it. By forward declaring
 * instead of requiring, no hard dependency is made, and (if not required
 * elsewhere) the namespace may never be required and thus, not be pulled
 * into the JavaScript binary. If it is required elsewhere, it will be type
 * checked as normal.
 *
 *
 * @param {string} name The namespace to forward declare in the form of
 *     "goog.package.part".
 */
goog.forwardDeclare = function(name) {};


/**
 * Forward declare type information. Used to assign types to goog.global
 * referenced object that would otherwise result in unknown type references
 * and thus block property disambiguation.
 */
goog.forwardDeclare('Document');
goog.forwardDeclare('XMLHttpRequest');


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return (name in goog.loadedModules_) ||
        (!goog.implicitNamespaces_[name] &&
            goog.isDefAndNotNull(goog.getObjectByName(name)));
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares that 'goog' and
   * 'goog.events' must be namespaces.
   *
   * @type {!Object<string, (boolean|undefined)>}
   * @private
   */
  goog.implicitNamespaces_ = {'goog.module': true};

  // NOTE: We add goog.module as an implicit namespace as goog.module is defined
  // here and because the existing module package has not been moved yet out of
  // the goog.module namespace. This satisifies both the debug loader and
  // ahead-of-time dependency management.
}


/**
 * Returns an object based on its fully qualified external name.  The object
 * is not found if null or undefined.  If you are using a compilation pass that
 * renames property names beware that using this function will not find renamed
 * properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {!Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {!Array<string>} provides An array of strings with
 *     the names of the objects this file provides.
 * @param {!Array<string>} requires An array of strings with
 *     the names of the objects this file requires.
 * @param {boolean=} opt_isModule Whether this dependency must be loaded as
 *     a module as declared by goog.module.
 */
goog.addDependency = function(relPath, provides, requires, opt_isModule) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      deps.pathIsModule[path] = !!opt_isModule;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(nnaze): The debug DOM loader was included in base.js as an original way
// to do "debug-mode" development.  The dependency system can sometimes be
// confusing, as can the debug DOM loader's asynchronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the script
// will not load until some point after the current script.  If a namespace is
// needed at runtime, it needs to be defined in a previous script, or loaded via
// require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// https://developers.google.com/closure/library/docs/depswriter
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.define('goog.ENABLE_DEBUG_LOADER', true);


/**
 * @param {string} msg
 * @private
 */
goog.logToConsole_ = function(msg) {
  if (goog.global.console) {
    goog.global.console['error'](msg);
  }
};


/**
 * Implements a system for the dynamic resolution of dependencies that works in
 * parallel with the BUILD system. Note that all calls to goog.require will be
 * stripped by the JSCompiler when the --process_closure_primitives option is
 * used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide()) in
 *     the form "goog.package.part".
 * @return {?} If called within a goog.module file, the associated namespace or
 *     module otherwise null.
 */
goog.require = function(name) {
  // If the object already exists we do not need do do anything.
  if (!COMPILED) {
    if (goog.ENABLE_DEBUG_LOADER && goog.IS_OLD_IE_) {
      goog.maybeProcessDeferredDep_(name);
    }

    if (goog.isProvided_(name)) {
      if (goog.isInModuleLoader_()) {
        return goog.module.getInternal_(name);
      } else {
        return null;
      }
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.writeScripts_(path);
        return null;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    goog.logToConsole_(errorMessage);

    throw Error(errorMessage);
  }
};


/**
 * Path for included scripts.
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default, the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 * @type {(function(string): boolean)|undefined}
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error will be thrown
 * when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as an argument
 * because that would make it more difficult to obfuscate our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always returns the same
 * instance object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


/**
 * @define {boolean} Whether to load goog.modules using {@code eval} when using
 * the debug loader.  This provides a better debugging experience as the
 * source is unmodified and can be edited using Chrome Workspaces or similar.
 * However in some environments the use of {@code eval} is banned
 * so we provide an alternative.
 */
goog.define('goog.LOAD_MODULE_USING_EVAL', true);


/**
 * @define {boolean} Whether the exports of goog.modules should be sealed when
 * possible.
 */
goog.define('goog.SEAL_MODULE_EXPORTS', goog.DEBUG);


/**
 * The registry of initialized modules:
 * the module identifier to module exports map.
 * @private @const {!Object<string, ?>}
 */
goog.loadedModules_ = {};


/**
 * True if goog.dependencies_ is available.
 * @const {boolean}
 */
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;


if (goog.DEPENDENCIES_ENABLED) {

  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts.
   * @private
   * @type {{
   *   pathIsModule: !Object<string, boolean>,
   *   nameToPath: !Object<string, string>,
   *   requires: !Object<string, !Object<string, boolean>>,
   *   visited: !Object<string, boolean>,
   *   written: !Object<string, boolean>,
   *   deferred: !Object<string, string>
   * }}
   */
  goog.dependencies_ = {
    pathIsModule: {}, // 1 to 1

    nameToPath: {}, // 1 to 1

    requires: {}, // 1 to many

    // Used when resolving dependencies to prevent us from visiting file twice.
    visited: {},

    written: {}, // Used to keep track of script files we have written.

    deferred: {} // Used to track deferred module evaluations in old IEs
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    /** @type {Document} */
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of base.js script that bootstraps Closure.
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.isDef(goog.global.CLOSURE_BASE_PATH)) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    /** @type {Document} */
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('SCRIPT');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var script = /** @type {!HTMLScriptElement} */ (scripts[i]);
      var src = script.src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @private
   */
  goog.importScript_ = function(src, opt_sourceText) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (importScript(src, opt_sourceText)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /** @const @private {boolean} */
  goog.IS_OLD_IE_ = !!(!goog.global.atob && goog.global.document &&
      goog.global.document.all);


  /**
   * Given a URL initiate retrieval and execution of the module.
   * @param {string} src Script source URL.
   * @private
   */
  goog.importModule_ = function(src) {
    // In an attempt to keep browsers from timing out loading scripts using
    // synchronous XHRs, put each load in its own script block.
    var bootstrap = 'goog.retrieveAndExecModule_("' + src + '");';

    if (goog.importScript_('', bootstrap)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /** @private {!Array<string>} */
  goog.queuedModules_ = [];


  /**
   * Return an appropriate module text. Suitable to insert into
   * a script tag (that is unescaped).
   * @param {string} srcUrl
   * @param {string} scriptText
   * @return {string}
   * @private
   */
  goog.wrapModule_ = function(srcUrl, scriptText) {
    if (!goog.LOAD_MODULE_USING_EVAL || !goog.isDef(goog.global.JSON)) {
      return '' +
          'goog.loadModule(function(exports) {' +
          '"use strict";' +
          scriptText +
          '\n' + // terminate any trailing single line comment.
          ';return exports' +
          '});' +
          '\n//# sourceURL=' + srcUrl + '\n';
    } else {
      return '' +
          'goog.loadModule(' +
          goog.global.JSON.stringify(
              scriptText + '\n//# sourceURL=' + srcUrl + '\n') +
          ');';
    }
  };

  // On IE9 and earlier, it is necessary to handle
  // deferred module loads. In later browsers, the
  // code to be evaluated is simply inserted as a script
  // block in the correct order. To eval deferred
  // code at the right time, we piggy back on goog.require to call
  // goog.maybeProcessDeferredDep_.
  //
  // The goog.requires are used both to bootstrap
  // the loading process (when no deps are available) and
  // declare that they should be available.
  //
  // Here we eval the sources, if all the deps are available
  // either already eval'd or goog.require'd.  This will
  // be the case when all the dependencies have already
  // been loaded, and the dependent module is loaded.
  //
  // But this alone isn't sufficient because it is also
  // necessary to handle the case where there is no root
  // that is not deferred.  For that there we register for an event
  // and trigger goog.loadQueuedModules_ handle any remaining deferred
  // evaluations.

  /**
   * Handle any remaining deferred goog.module evals.
   * @private
   */
  goog.loadQueuedModules_ = function() {
    var count = goog.queuedModules_.length;
    if (count > 0) {
      var queue = goog.queuedModules_;
      goog.queuedModules_ = [];
      for (var i = 0; i < count; i++) {
        var path = queue[i];
        goog.maybeProcessDeferredPath_(path);
      }
    }
  };


  /**
   * Eval the named module if its dependencies are
   * available.
   * @param {string} name The module to load.
   * @private
   */
  goog.maybeProcessDeferredDep_ = function(name) {
    if (goog.isDeferredModule_(name) &&
        goog.allDepsAreAvailable_(name)) {
      var path = goog.getPathFromDeps_(name);
      goog.maybeProcessDeferredPath_(goog.basePath + path);
    }
  };

  /**
   * @param {string} name The module to check.
   * @return {boolean} Whether the name represents a
   *     module whose evaluation has been deferred.
   * @private
   */
  goog.isDeferredModule_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && goog.dependencies_.pathIsModule[path]) {
      var abspath = goog.basePath + path;
      return (abspath) in goog.dependencies_.deferred;
    }
    return false;
  };

  /**
   * @param {string} name The module to check.
   * @return {boolean} Whether the name represents a
   *     module whose declared dependencies have all been loaded
   *     (eval'd or a deferred module load)
   * @private
   */
  goog.allDepsAreAvailable_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && (path in goog.dependencies_.requires)) {
      for (var requireName in goog.dependencies_.requires[path]) {
        if (!goog.isProvided_(requireName) &&
            !goog.isDeferredModule_(requireName)) {
          return false;
        }
      }
    }
    return true;
  };


  /**
   * @param {string} abspath
   * @private
   */
  goog.maybeProcessDeferredPath_ = function(abspath) {
    if (abspath in goog.dependencies_.deferred) {
      var src = goog.dependencies_.deferred[abspath];
      delete goog.dependencies_.deferred[abspath];
      goog.globalEval(src);
    }
  };


  /**
   * @param {function(?):?|string} moduleDef The module definition.
   */
  goog.loadModule = function(moduleDef) {
    // NOTE: we allow function definitions to be either in the from
    // of a string to eval (which keeps the original source intact) or
    // in a eval forbidden environment (CSP) we allow a function definition
    // which in its body must call {@code goog.module}, and return the exports
    // of the module.
    var previousState = goog.moduleLoaderState_;
    try {
      goog.moduleLoaderState_ = {moduleName: undefined};
      var exports;
      if (goog.isFunction(moduleDef)) {
        exports = moduleDef.call(goog.global, {});
      } else if (goog.isString(moduleDef)) {
        exports = goog.loadModuleFromSource_.call(goog.global, moduleDef);
      } else {
        throw Error('Invalid module definition');
      }

      var moduleName = goog.moduleLoaderState_.moduleName;
      if (!goog.isString(moduleName) || !moduleName) {
        throw Error('Invalid module name \"' + moduleName + '\"');
      }

      // Don't seal legacy namespaces as they may be uses as a parent of
      // another namespace
      if (goog.moduleLoaderState_.declareLegacyNamespace) {
        goog.constructNamespace_(moduleName, exports);
      } else if (goog.SEAL_MODULE_EXPORTS && Object.seal) {
        Object.seal(exports);
      }

      goog.loadedModules_[moduleName] = exports;
    } finally {
      goog.moduleLoaderState_ = previousState;
    }
  };


  /**
   * @private @const {function(string):?}
   * @suppress {newCheckTypes}
   */
  goog.loadModuleFromSource_ = function() {
    // NOTE: we avoid declaring parameters or local variables here to avoid
    // masking globals or leaking values into the module definition.
    'use strict';
    var exports = {};
    eval(arguments[0]);
    return exports;
  };


  /**
   * Writes a new script pointing to {@code src} directly into the DOM.
   *
   * NOTE: This method is not CSP-compliant. @see goog.appendScriptSrcNode_ for
   * the fallback mechanism.
   *
   * @param {string} src The script URL.
   * @private
   */
  goog.writeScriptSrcNode_ = function(src) {
    goog.global.document.write(
        '<script type="text/javascript" src="' + src + '"></' + 'script>');
  };


  /**
   * Appends a new script node to the DOM using a CSP-compliant mechanism. This
   * method exists as a fallback for document.write (which is not allowed in a
   * strict CSP context, e.g., Chrome apps).
   *
   * NOTE: This method is not analogous to using document.write to insert a
   * <script> tag; specifically, the user agent will execute a script added by
   * document.write immediately after the current script block finishes
   * executing, whereas the DOM-appended script node will not be executed until
   * the entire document is parsed and executed. That is to say, this script is
   * added to the end of the script execution queue.
   *
   * The page must not attempt to call goog.required entities until after the
   * document has loaded, e.g., in or after the window.onload callback.
   *
   * @param {string} src The script URL.
   * @private
   */
  goog.appendScriptSrcNode_ = function(src) {
    /** @type {Document} */
    var doc = goog.global.document;
    var scriptEl = doc.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.src = src;
    scriptEl.defer = false;
    scriptEl.async = false;
    doc.head.appendChild(scriptEl);
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script url.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src, opt_sourceText) {
    if (goog.inHtmlDocument_()) {
      /** @type {Document} */
      var doc = goog.global.document;

      // If the user tries to require a new symbol after document load,
      // something has gone terribly wrong. Doing a document.write would
      // wipe out the page. This does not apply to the CSP-compliant method
      // of writing script tags.
      if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING &&
          doc.readyState == 'complete') {
        // Certain test frameworks load base.js multiple times, which tries
        // to write deps.js each time. If that happens, just fail silently.
        // These frameworks wipe the page between each load of base.js, so this
        // is OK.
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }

      var isOldIE = goog.IS_OLD_IE_;

      if (opt_sourceText === undefined) {
        if (!isOldIE) {
          if (goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING) {
            goog.appendScriptSrcNode_(src);
          } else {
            goog.writeScriptSrcNode_(src);
          }
        } else {
          var state = " onreadystatechange='goog.onScriptLoad_(this, " +
              ++goog.lastNonModuleScriptIndex_ + ")' ";
          doc.write(
              '<script type="text/javascript" src="' +
                  src + '"' + state + '></' + 'script>');
        }
      } else {
        doc.write(
            '<script type="text/javascript">' +
            opt_sourceText +
            '</' + 'script>');
      }
      return true;
    } else {
      return false;
    }
  };


  /** @private {number} */
  goog.lastNonModuleScriptIndex_ = 0;


  /**
   * A readystatechange handler for legacy IE
   * @param {!HTMLScriptElement} script
   * @param {number} scriptIndex
   * @return {boolean}
   * @private
   */
  goog.onScriptLoad_ = function(script, scriptIndex) {
    // for now load the modules when we reach the last script,
    // later allow more inter-mingling.
    if (script.readyState == 'complete' &&
        goog.lastNonModuleScriptIndex_ == scriptIndex) {
      goog.loadQueuedModules_();
    }
    return true;
  };

  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @param {string} pathToLoad The path from which to start discovering
   *     dependencies.
   * @private
   */
  goog.writeScripts_ = function(pathToLoad) {
    /** @type {!Array<string>} The scripts we need to write this time. */
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    /** @param {string} path */
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // We have already visited this one. We can get here if we have cyclic
      // dependencies.
      if (path in deps.visited) {
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    visitNode(pathToLoad);

    // record that we are going to load all these scripts.
    for (var i = 0; i < scripts.length; i++) {
      var path = scripts[i];
      goog.dependencies_.written[path] = true;
    }

    // If a module is loaded synchronously then we need to
    // clear the current inModuleLoader value, and restore it when we are
    // done loading the current "requires".
    var moduleState = goog.moduleLoaderState_;
    goog.moduleLoaderState_ = null;

    for (var i = 0; i < scripts.length; i++) {
      var path = scripts[i];
      if (path) {
        if (!deps.pathIsModule[path]) {
          goog.importScript_(goog.basePath + path);
        } else {
          goog.importModule_(goog.basePath + path);
        }
      } else {
        goog.moduleLoaderState_ = moduleState;
        throw Error('Undefined script input');
      }
    }

    // restore the current "module loading state"
    goog.moduleLoaderState_ = moduleState;
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}


/**
 * Normalize a file path by removing redundant ".." and extraneous "." file
 * path components.
 * @param {string} path
 * @return {string}
 * @private
 */
goog.normalizePath_ = function(path) {
  var components = path.split('/');
  var i = 0;
  while (i < components.length) {
    if (components[i] == '.') {
      components.splice(i, 1);
    } else if (i && components[i] == '..' &&
        components[i - 1] && components[i - 1] != '..') {
      components.splice(--i, 2);
    } else {
      i++;
    }
  }
  return components.join('/');
};


/**
 * Loads file by synchronous XHR. Should not be used in production environments.
 * @param {string} src Source URL.
 * @return {string} File contents.
 * @private
 */
goog.loadFileSync_ = function(src) {
  if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
    return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
  } else {
    /** @type {XMLHttpRequest} */
    var xhr = new goog.global['XMLHttpRequest']();
    xhr.open('get', src, false);
    xhr.send();
    return xhr.responseText;
  }
};


/**
 * Retrieve and execute a module.
 * @param {string} src Script source URL.
 * @private
 */
goog.retrieveAndExecModule_ = function(src) {
  if (!COMPILED) {
    // The full but non-canonicalized URL for later use.
    var originalPath = src;
    // Canonicalize the path, removing any /./ or /../ since Chrome's debugging
    // console doesn't auto-canonicalize XHR loads as it does <script> srcs.
    src = goog.normalizePath_(src);

    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;

    var scriptText = goog.loadFileSync_(src);

    if (scriptText != null) {
      var execModuleScript = goog.wrapModule_(src, scriptText);
      var isOldIE = goog.IS_OLD_IE_;
      if (isOldIE) {
        goog.dependencies_.deferred[originalPath] = execModuleScript;
        goog.queuedModules_.push(originalPath);
      } else {
        importScript(src, execModuleScript);
      }
    } else {
      throw new Error('load of ' + src + 'failed');
    }
  }
};


//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case.
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }

    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox typeof
    // behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
    // would like to return object for those and we can detect an invalid
    // function by making sure that the function object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property. As a special case, a function value is not array like, because its
 * length property is fixed to correspond to the number of expected arguments.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  // We do not use goog.isObject here in order to exclude function values.
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like the
 * value needs to be an object and have a getFullYear() function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays and
 * functions.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. The unique ID is
 * guaranteed to be unique across the current session amongst objects that are
 * passed into {@code getUid}. There is no guarantee that the ID is unique or
 * consistent across sessions. It is unsafe to generate unique ID for function
 * prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Whether the given object is already assigned a unique ID.
 *
 * This does not modify the object.
 *
 * @param {!Object} obj The object to check.
 * @return {boolean} Whether there is an assigned unique id for the object.
 */
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In IE, DOM nodes are not instances of Object and throw an exception if we
  // try to delete.  Instead we try to use removeAttribute.
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure JavaScript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind is
 *     deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of this 'pre-specified'.
 *
 * Remaining arguments specified at call-time are appended to the pre-specified
 * ones.
 *
 * Also see: {@link #partial}.
 *
 * Usage:
 * <pre>var barMethBound = goog.bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function goog.bind() was
 *     invoked as a method of.
 * @template T
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default Chrome
      // extension environment. This means that for Chrome extensions, they get
      // the implementation of Function.prototype.bind that calls goog.bind
      // instead of the native one. Even worse, we don't want to introduce a
      // circular dependency between goog.bind and Function.prototype.bind, so
      // we have to hack this to make sure it works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like goog.bind(), except that a 'this object' is not required. Useful when
 * the target function is already bound.
 *
 * Usage:
 * var g = goog.partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function goog.partial()
 *     was invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Clone the array (with slice()) and append additional arguments
    // to the existing arguments.
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = (goog.TRUSTED_SITE && Date.now) || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals JavaScript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _evalTest_ = 1;');
      if (typeof goog.global['_evalTest_'] != 'undefined') {
        try {
          delete goog.global['_evalTest_'];
        } catch (ignore) {
          // Microsoft edge fails the deletion above in strict mode.
        }
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      /** @type {Document} */
      var doc = goog.global.document;
      var scriptElt = doc.createElement('SCRIPT');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @private {!Object<string, string>|undefined}
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a hyphen and
 * passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which these
 * mappings are used. In the BY_PART style, each part (i.e. in between hyphens)
 * of the passed in css name is rewritten according to the map. In the BY_WHOLE
 * style, the full css name is looked up in the map directly. If a rewrite is
 * not specified by the map, the compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls to
 * goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed only the
 * modifier will be processed, as it is assumed the first argument was generated
 * as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --process_closure_primitives flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {!Object<string, string>|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Gets a localized message.
 *
 * This function is a compiler primitive. If you give the compiler a localized
 * message bundle, it will replace the string at compile-time with a localized
 * version, and expand goog.getMsg call to a concatenated string.
 *
 * Messages must be initialized in the form:
 * <code>
 * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
 * </code>
 *
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object<string, string>=} opt_values Maps place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  if (opt_values) {
    str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
      return key in opt_values ? opt_values[key] : match;
    });
  }
  return str;
};


/**
 * Gets a localized message. If the message does not have a translation, gives a
 * fallback message.
 *
 * This is useful when introducing a new message that has not yet been
 * translated into all languages.
 *
 * This function is a compiler primitive. Must be used in the form:
 * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
 * where MSG_A and MSG_B were initialized with goog.getMsg.
 *
 * @param {string} a The preferred message.
 * @param {string} b The fallback message.
 * @return {string} The best translated message.
 */
goog.getMsgWithFallback = function(a, b) {
  return a;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated, unless they are
 * exported in turn via this function or goog.exportProperty.
 *
 * Also handy for making public items that are defined in anonymous closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction', Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is goog.global.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  /**
   * Calls superclass constructor/method.
   *
   * This function is only available if you use goog.inherits to
   * express inheritance relationships between classes.
   *
   * NOTE: This is a replacement for goog.base and for superClass_
   * property defined in childCtor.
   *
   * @param {!Object} me Should always be "this".
   * @param {string} methodName The method name to call. Calling
   *     superclass constructor can be done with the special string
   *     'constructor'.
   * @param {...*} var_args The arguments to pass to superclass
   *     method/constructor.
   * @return {*} The return value of the superclass method/constructor.
   */
  childCtor.base = function(me, methodName, var_args) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * constructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass the name of the
 * method as the second argument to this function. If you do not, you will get a
 * runtime error. This calls the superclass' method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express inheritance
 * relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the compiler will do
 * macro expansion to remove a lot of the extra overhead that this function
 * introduces. The compiler will also enforce a lot of the assumptions that this
 * function makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 * @suppress {es5Strict} This method can not be used in strict mode, but
 *     all Closure Library consumers must depend on this file.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;

  if (goog.STRICT_MODE_COMPATIBLE || (goog.DEBUG && !caller)) {
    throw Error('arguments.caller not defined.  goog.base() cannot be used ' +
                'with strict mode code. See ' +
                'http://www.ecma-international.org/ecma-262/5.1/#sec-C');
  }

  if (caller.superClass_) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var ctorArgs = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      ctorArgs[i - 1] = arguments[i];
    }
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(me, ctorArgs);
  }

  // Copying using loop to avoid deop due to passing arguments object to
  // function. This is faster in many JS engines as of late 2014.
  var args = new Array(arguments.length - 2);
  for (var i = 2; i < arguments.length; i++) {
    args[i - 2] = arguments[i];
  }
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain, then one of two
  // things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the aliases
 * applied.  In uncompiled code the function is simply run since the aliases as
 * written are valid JavaScript.
 *
 *
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *     (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


/*
 * To support uncompiled, strict mode bundles that use eval to divide source
 * like so:
 *    eval('someSource;//# sourceUrl sourcefile.js');
 * We need to export the globally defined symbols "goog" and "COMPILED".
 * Exporting "goog" breaks the compiler optimizations, so we required that
 * be defined externally.
 * NOTE: We don't use goog.exportSymbol here because we don't want to trigger
 * extern generation when that compiler option is enabled.
 */
if (!COMPILED) {
  goog.global['COMPILED'] = COMPILED;
}



//==============================================================================
// goog.defineClass implementation
//==============================================================================


/**
 * Creates a restricted form of a Closure "class":
 *   - from the compiler's perspective, the instance returned from the
 *     constructor is sealed (no new properties may be added).  This enables
 *     better checks.
 *   - the compiler will rewrite this definition to a form that is optimal
 *     for type checking and optimization (initially this will be a more
 *     traditional form).
 *
 * @param {Function} superClass The superclass, Object or null.
 * @param {goog.defineClass.ClassDescriptor} def
 *     An object literal describing
 *     the class.  It may have the following properties:
 *     "constructor": the constructor function
 *     "statics": an object literal containing methods to add to the constructor
 *        as "static" methods or a function that will receive the constructor
 *        function as its only parameter to which static properties can
 *        be added.
 *     all other properties are added to the prototype.
 * @return {!Function} The class constructor.
 */
goog.defineClass = function(superClass, def) {
  // TODO(johnlenz): consider making the superClass an optional parameter.
  var constructor = def.constructor;
  var statics = def.statics;
  // Wrap the constructor prior to setting up the prototype and static methods.
  if (!constructor || constructor == Object.prototype.constructor) {
    constructor = function() {
      throw Error('cannot instantiate an interface (no constructor defined).');
    };
  }

  var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
  if (superClass) {
    goog.inherits(cls, superClass);
  }

  // Remove all the properties that should not be copied to the prototype.
  delete def.constructor;
  delete def.statics;

  goog.defineClass.applyProperties_(cls.prototype, def);
  if (statics != null) {
    if (statics instanceof Function) {
      statics(cls);
    } else {
      goog.defineClass.applyProperties_(cls, statics);
    }
  }

  return cls;
};


/**
 * @typedef {
 *     !Object|
 *     {constructor:!Function}|
 *     {constructor:!Function, statics:(Object|function(Function):void)}}
 * @suppress {missingProvide}
 */
goog.defineClass.ClassDescriptor;


/**
 * @define {boolean} Whether the instances returned by
 * goog.defineClass should be sealed when possible.
 */
goog.define('goog.defineClass.SEAL_CLASS_INSTANCES', goog.DEBUG);


/**
 * If goog.defineClass.SEAL_CLASS_INSTANCES is enabled and Object.seal is
 * defined, this function will wrap the constructor in a function that seals the
 * results of the provided constructor function.
 *
 * @param {!Function} ctr The constructor whose results maybe be sealed.
 * @param {Function} superClass The superclass constructor.
 * @return {!Function} The replacement constructor.
 * @private
 */
goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
  if (goog.defineClass.SEAL_CLASS_INSTANCES &&
      Object.seal instanceof Function) {
    // Don't seal subclasses of unsealable-tagged legacy classes.
    if (superClass && superClass.prototype &&
        superClass.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
      return ctr;
    }
    /**
     * @this {Object}
     * @return {?}
     */
    var wrappedCtr = function() {
      // Don't seal an instance of a subclass when it calls the constructor of
      // its super class as there is most likely still setup to do.
      var instance = ctr.apply(this, arguments) || this;
      instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];
      if (this.constructor === wrappedCtr) {
        Object.seal(instance);
      }
      return instance;
    };
    return wrappedCtr;
  }
  return ctr;
};


// TODO(johnlenz): share these values with the goog.object
/**
 * The names of the fields that are defined on Object.prototype.
 * @type {!Array<string>}
 * @private
 * @const
 */
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


// TODO(johnlenz): share this function with the goog.object
/**
 * @param {!Object} target The object to add properties to.
 * @param {!Object} source The object to copy properties from.
 * @private
 */
goog.defineClass.applyProperties_ = function(target, source) {
  // TODO(johnlenz): update this to support ES5 getters/setters

  var key;
  for (key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }

  // For IE the for-in-loop does not contain any properties that are not
  // enumerable on the prototype object (for example isPrototypeOf from
  // Object.prototype) and it will also not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
  for (var i = 0; i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; i++) {
    key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i];
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
};


/**
 * Sealing classes breaks the older idiom of assigning properties on the
 * prototype rather than in the constructor.  As such, goog.defineClass
 * must not seal subclasses of these old-style classes until they are fixed.
 * Until then, this marks a class as "broken", instructing defineClass
 * not to seal subclasses.
 * @param {!Function} ctr The legacy constructor to tag as unsealable.
 */
goog.tagUnsealableClass = function(ctr) {
  if (!COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES) {
    ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = true;
  }
};


/**
 * Name for unsealable tag property.
 * @const @private {string}
 */
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = 'goog_defineClass_legacy_unsealable';

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Attempt to ensure there is a stack trace.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    var stack = new Error().stack;
    if (stack) {
      this.stack = stack;
    }
  }

  if (opt_msg) {
    this.message = String(opt_msg);
  }

  /**
   * Whether to report this error to the server. Setting this to false will
   * cause the error reporter to not report the error back to the server,
   * which can be useful if the client knows that the error has already been
   * logged on the server.
   * @type {boolean}
   */
  this.reportErrorToServer = true;
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of goog.dom.NodeType.
 */

goog.provide('goog.dom.NodeType');


/**
 * Constants for the nodeType attribute in the Node interface.
 *
 * These constants match those specified in the Node interface. These are
 * usually present on the Node object in recent browsers, but not in older
 * browsers (specifically, early IEs) and thus are given here.
 *
 * In some browsers (early IEs), these are not defined on the Node object,
 * so they are provided here.
 *
 * See http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1950641247
 * @enum {number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 * @author arv@google.com (Erik Arvidsson)
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * @define {boolean} Enables HTML escaping of lowercase letter "e" which helps
 * with detection of double-escaping as this letter is frequently used.
 */
goog.define('goog.string.DETECT_DOUBLE_ESCAPING', false);


/**
 * @define {boolean} Whether to force non-dom html unescaping.
 */
goog.define('goog.string.FORCE_NON_DOM_HTML_UNESCAPING', false);


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Case-insensitive equality checker.
 * @param {string} str1 First string to check.
 * @param {string} str2 Second string to check.
 * @return {boolean} True if {@code str1} and {@code str2} are the same string,
 *     ignoring case.
 */
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  var splitParts = str.split('%s');
  var returnString = '';

  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length &&
         // Replace up to the last split part. We are inserting in the
         // positions between split parts.
         splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }

  return returnString + splitParts.join('%s'); // Join unused '%s'
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty or whitespace only.
 */
goog.string.isEmptyOrWhitespace = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is empty.
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty.
 */
goog.string.isEmptyString = function(str) {
  return str.length == 0;
};


/**
 * Checks if a string is empty or contains only whitespaces.
 *
 * TODO(user): Deprecate this when clients have been switched over to
 * goog.string.isEmptyOrWhitespace.
 *
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = goog.string.isEmptyOrWhitespace;


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} Whether {@code str} is null, undefined, empty, or
 *     whitespace only.
 * @deprecated Use goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str))
 *     instead.
 */
goog.string.isEmptyOrWhitespaceSafe = function(str) {
  return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str));
};


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 *
 * TODO(user): Deprecate this when clients have been switched over to
 * goog.string.isEmptyOrWhitespaceSafe.
 *
 * @param {*} str The string to check.
 * @return {boolean} Whether {@code str} is null, undefined, empty, or
 *     whitespace only.
 */
goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {@code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {@code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = (goog.TRUSTED_SITE && String.prototype.trim) ?
    function(str) {
      return str.trim();
    } :
    function(str) {
      // Since IE doesn't include non-breaking-space (0xa0) in their \s
      // character class (as required by section 7.2 of the ECMAScript spec),
      // we explicitly include it in the regexp to enforce consistent
      // cross-browser behavior.
      return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    };


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Regular expression used for splitting a string into substrings of fractional
 * numbers, integers, and non-numeric characters.
 * @type {RegExp}
 * @private
 */
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;


/**
 * String comparison function that handles numbers in a way humans might expect.
 * Using this function, the string "File 2.jpg" sorts before "File 10.jpg". The
 * comparison is mostly case-insensitive, though strings that are identical
 * except for case are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is significantly slower (about 500x) than either
 * the default or the case-insensitive compare. It should not be used in
 * time-critical code, but should be fast enough to sort several hundred short
 * strings (like filenames) with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {

      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII-betical string
  // comparison to stablize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escapes double quote '"' and single quote '\'' characters in addition to
 * '&', '<', and '>' so that a string can be included in an HTML tag attribute
 * value within double or single quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * With goog.string.DETECT_DOUBLE_ESCAPING, this function escapes also the
 * lowercase letter "e".
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    str = str.replace(goog.string.AMP_RE_, '&amp;')
          .replace(goog.string.LT_RE_, '&lt;')
          .replace(goog.string.GT_RE_, '&gt;')
          .replace(goog.string.QUOT_RE_, '&quot;')
          .replace(goog.string.SINGLE_QUOTE_RE_, '&#39;')
          .replace(goog.string.NULL_RE_, '&#0;');
    if (goog.string.DETECT_DOUBLE_ESCAPING) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.ALL_RE_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.AMP_RE_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.LT_RE_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.GT_RE_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.QUOT_RE_, '&quot;');
    }
    if (str.indexOf('\'') != -1) {
      str = str.replace(goog.string.SINGLE_QUOTE_RE_, '&#39;');
    }
    if (str.indexOf('\x00') != -1) {
      str = str.replace(goog.string.NULL_RE_, '&#0;');
    }
    if (goog.string.DETECT_DOUBLE_ESCAPING && str.indexOf('e') != -1) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.AMP_RE_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.LT_RE_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.GT_RE_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.QUOT_RE_ = /"/g;


/**
 * Regular expression that matches a single quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.SINGLE_QUOTE_RE_ = /'/g;


/**
 * Regular expression that matches null character, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.NULL_RE_ = /\x00/g;


/**
 * Regular expression that matches a lowercase letter "e", for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.E_RE_ = /e/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @const {!RegExp}
 * @private
 */
goog.string.ALL_RE_ = (goog.string.DETECT_DOUBLE_ESCAPING ?
    /[\x00&<>"'e]/ :
    /[\x00&<>"']/);


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one or we explicitly
    // requested non-DOM html unescaping.
    if (!goog.string.FORCE_NON_DOM_HTML_UNESCAPING &&
        'document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes a HTML string using the provided document.
 *
 * @param {string} str The string to unescape.
 * @param {!Document} document A document to use in escaping the string.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if (goog.string.contains(str, '&')) {
    return goog.string.unescapeEntitiesUsingDom_(str, document);
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @param {Document=} opt_document An optional document to use for creating
 *     elements. If this is not specified then the default window.document
 *     will be used.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  /** @type {!Object<string, string>} */
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div;
  if (opt_document) {
    div = opt_document.createElement('div');
  } else {
    div = goog.global.document.createElement('div');
  }
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  // This doesn't use goog.string.preserveSpaces for backwards compatibility.
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Preserve spaces that would be otherwise collapsed in HTML by replacing them
 * with non-breaking space Unicode characters.
 * @param {string} str The string in which to preserve whitespace.
 * @return {string} A copy of {@code str} with preserved whitespace.
 */
goog.string.preserveSpaces = function(str) {
  return str.replace(/(^|[\n ]) /g, '$1' + goog.string.Unicode.NBSP);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private {!Object<string, string>}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private {!Object<string, string>}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
          ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join('');
  }
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }

  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }

  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Determines whether a string contains a substring.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.contains = function(str, subString) {
  return str.indexOf(subString) != -1;
};


/**
 * Determines whether a string contains a substring, ignoring case.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.caseInsensitiveContains = function(str, subString) {
  return goog.string.contains(str.toLowerCase(), subString.toLowerCase());
};


/**
 * Returns the non-overlapping occurrences of ss in s.
 * If either s or ss evalutes to false, then returns zero.
 * @param {string} s The string to look in.
 * @param {string} ss The string to look for.
 * @return {number} Number of occurrences of ss in s.
 */
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = (String.prototype.repeat) ?
    function(string, length) {
      // The native method is over 100 times faster than the alternative.
      return string.repeat(length);
    } :
    function(string, length) {
      return new Array(length + 1).join(string);
    };


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    // Normalize to 4 byte range, 0 ... 2^32.
    result = (31 * result + str.charCodeAt(i)) >>> 0;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Infinity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmptyOrWhitespace(str)) {
    return NaN;
  }
  return num;
};


/**
 * Returns whether the given string is lower camel case (e.g. "isFooBar").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is lower camel case.
 */
goog.string.isLowerCamelCase = function(str) {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};


/**
 * Returns whether the given string is upper camel case (e.g. "FooBarBaz").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is upper camel case.
 */
goog.string.isUpperCamelCase = function(str) {
  return /^([A-Z][a-z]*)+$/.test(str);
};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, '-$1').toLowerCase();
};


/**
 * Converts a string into TitleCase. First character of the string is always
 * capitalized in addition to the first letter of every subsequent word.
 * Words are delimited by one or more whitespaces by default. Custom delimiters
 * can optionally be specified to replace the default, which doesn't preserve
 * whitespace delimiters and instead must be explicitly included if needed.
 *
 * Default delimiter => " ":
 *    goog.string.toTitleCase('oneTwoThree')    => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three')  => 'One Two Three'
 *    goog.string.toTitleCase('  one   two   ') => '  One   Two   '
 *    goog.string.toTitleCase('one_two_three')  => 'One_two_three'
 *    goog.string.toTitleCase('one-two-three')  => 'One-two-three'
 *
 * Custom delimiter => "_-.":
 *    goog.string.toTitleCase('oneTwoThree', '_-.')       => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three', '_-.')     => 'One two three'
 *    goog.string.toTitleCase('  one   two   ', '_-.')    => '  one   two   '
 *    goog.string.toTitleCase('one_two_three', '_-.')     => 'One_Two_Three'
 *    goog.string.toTitleCase('one-two-three', '_-.')     => 'One-Two-Three'
 *    goog.string.toTitleCase('one...two...three', '_-.') => 'One...Two...Three'
 *    goog.string.toTitleCase('one. two. three', '_-.')   => 'One. two. three'
 *    goog.string.toTitleCase('one-two.three', '_-.')     => 'One-Two.Three'
 *
 * @param {string} str String value in camelCase form.
 * @param {string=} opt_delimiters Custom delimiter character set used to
 *      distinguish words in the string value. Each character represents a
 *      single delimiter. When provided, default whitespace delimiter is
 *      overridden and must be explicitly included if needed.
 * @return {string} String value in TitleCase form.
 */
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ?
      goog.string.regExpEscape(opt_delimiters) : '\\s';

  // For IE8, we need to prevent using an empty character set. Otherwise,
  // incorrect matching will occur.
  delimiters = delimiters ? '|[' + delimiters + ']+' : '';

  var regexp = new RegExp('(^' + delimiters + ')([a-z])', 'g');
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};


/**
 * Capitalizes a string, i.e. converts the first letter to uppercase
 * and all other letters to lowercase, e.g.:
 *
 * goog.string.capitalize('one')     => 'One'
 * goog.string.capitalize('ONE')     => 'One'
 * goog.string.capitalize('one two') => 'One two'
 *
 * Note that this function does not trim initial whitespace.
 *
 * @param {string} str String value to capitalize.
 * @return {string} String value with first letter in uppercase.
 */
goog.string.capitalize = function(str) {
  return String(str.charAt(0)).toUpperCase() +
      String(str.substr(1)).toLowerCase();
};


/**
 * Parse a string in decimal or hexidecimal ('0xFFFF') form.
 *
 * To parse a particular radix, please use parseInt(string, radix) directly. See
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/parseInt
 *
 * This is a wrapper for the built-in parseInt function that will only parse
 * numbers as base 10 or base 16.  Some JS implementations assume strings
 * starting with "0" are intended to be octal. ES3 allowed but discouraged
 * this behavior. ES5 forbids it.  This function emulates the ES5 behavior.
 *
 * For more information, see Mozilla JS Reference: http://goo.gl/8RiFj
 *
 * @param {string|number|null|undefined} value The value to be parsed.
 * @return {number} The number, parsed. If the string failed to parse, this
 *     will be NaN.
 */
goog.string.parseInt = function(value) {
  // Force finite numbers to strings.
  if (isFinite(value)) {
    value = String(value);
  }

  if (goog.isString(value)) {
    // If the string starts with '0x' or '-0x', parse as hex.
    return /^\s*-?0x/i.test(value) ?
        parseInt(value, 16) : parseInt(value, 10);
  }

  return NaN;
};


/**
 * Splits a string on a separator a limited number of times.
 *
 * This implementation is more similar to Python or Java, where the limit
 * parameter specifies the maximum number of splits rather than truncating
 * the number of results.
 *
 * See http://docs.python.org/2/library/stdtypes.html#str.split
 * See JavaDoc: http://goo.gl/F2AsY
 * See Mozilla reference: http://goo.gl/dZdZs
 *
 * @param {string} str String to split.
 * @param {string} separator The separator.
 * @param {number} limit The limit to the number of splits. The resulting array
 *     will have a maximum length of limit+1.  Negative numbers are the same
 *     as zero.
 * @return {!Array<string>} The string, split.
 */

goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];

  // Only continue doing this while we haven't hit the limit and we have
  // parts left.
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }

  // If there are remaining parts, append them to the end.
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }

  return returnVal;
};


/**
 * Computes the Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @return {number} The edit distance between the two strings.
 */
goog.string.editDistance = function(a, b) {
  var v0 = [];
  var v1 = [];

  if (a == b) {
    return 0;
  }

  if (!a.length || !b.length) {
    return Math.max(a.length, b.length);
  }

  for (var i = 0; i < b.length + 1; i++) {
    v0[i] = i;
  }

  for (var i = 0; i < a.length; i++) {
    v1[0] = i + 1;

    for (var j = 0; j < b.length; j++) {
      var cost = a[i] != b[j];
      // Cost for the substring is the minimum of adding one character, removing
      // one character, or a swap.
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }

    for (var j = 0; j < v0.length; j++) {
      v0[j] = v1[j];
    }
  }

  return v1[b.length];
};

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.dom.NodeType');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.define('goog.asserts.ENABLE_ASSERTS', goog.DEBUG);



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permanently modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * The default error handler.
 * @param {!goog.asserts.AssertionError} e The exception to be handled.
 */
goog.asserts.DEFAULT_ERROR_HANDLER = function(e) { throw e; };


/**
 * The handler responsible for throwing or logging assertion errors.
 * @private {function(!goog.asserts.AssertionError)}
 */
goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  var e = new goog.asserts.AssertionError('' + message, args || []);
  goog.asserts.errorHandler_(e);
};


/**
 * Sets a custom error handler that can be used to customize the behavior of
 * assertion failures, for example by turning all assertion failures into log
 * messages.
 * @param {function(!goog.asserts.AssertionError)} errorHandler
 */
goog.asserts.setErrorHandler = function(errorHandler) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_ = errorHandler;
  }
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @template T
 * @param {T} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {T} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_(new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1)));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array<?>} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array<?>} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is a DOM Element if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Element} The value, likely to be a DOM Element when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not an Element.
 */
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) ||
      value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_('Expected Element but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Element} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 *
 * The compiler may tighten the type returned by this function.
 *
 * @param {*} value The value to check.
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 * @return {T}
 * @template T
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('Expected instanceof %s but got %s.',
        [goog.asserts.getType_(type), goog.asserts.getType_(value)],
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};


/**
 * Checks that no enumerable keys are present in Object.prototype. Such keys
 * would break most code that use {@code for (var ... in ...)} loops.
 */
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + ' should not be enumerable in Object.prototype.');
  }
};


/**
 * Returns the type of a value. If a constructor is passed, and a suitable
 * string cannot be found, 'unknown type name' will be returned.
 * @param {*} value A constructor, object, or primitive.
 * @return {string} The best display name for the value, or 'unknown type name'.
 * @private
 */
goog.asserts.getType_ = function(value) {
  if (value instanceof Function) {
    return value.displayName || value.name || 'unknown type name';
  } else if (value instanceof Object) {
    return value.constructor.displayName || value.constructor.name ||
        Object.prototype.toString.call(value);
  } else {
    return value === null ? 'null' : typeof value;
  }
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating arrays.
 *
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.array');
goog.provide('goog.array.ArrayLike');

goog.require('goog.asserts');


/**
 * @define {boolean} NATIVE_ARRAY_PROTOTYPES indicates whether the code should
 * rely on Array.prototype functions, if available.
 *
 * The Array.prototype functions can be defined by external libraries like
 * Prototype and setting this flag to false forces closure to use its own
 * goog.array implementation.
 *
 * If your javascript can be loaded by a third party site and you are wary about
 * relying on the prototype functions, specify
 * "--define goog.NATIVE_ARRAY_PROTOTYPES=false" to the JSCompiler.
 *
 * Setting goog.TRUSTED_SITE to false will automatically set
 * NATIVE_ARRAY_PROTOTYPES to false.
 */
goog.define('goog.NATIVE_ARRAY_PROTOTYPES', goog.TRUSTED_SITE);


/**
 * @define {boolean} If true, JSCompiler will use the native implementation of
 * array functions where appropriate (e.g., {@code Array#filter}) and remove the
 * unused pure JS implementation.
 */
goog.define('goog.array.ASSUME_NATIVE_FUNCTIONS', false);


/**
 * @typedef {Array|NodeList|Arguments|{length: number}}
 */
goog.array.ArrayLike;


/**
 * Returns the last element in an array without removing it.
 * Same as goog.array.last.
 * @param {Array<T>|goog.array.ArrayLike} array The array.
 * @return {T} Last item in array.
 * @template T
 */
goog.array.peek = function(array) {
  return array[array.length - 1];
};


/**
 * Returns the last element in an array without removing it.
 * Same as goog.array.peek.
 * @param {Array<T>|goog.array.ArrayLike} array The array.
 * @return {T} Last item in array.
 * @template T
 */
goog.array.last = goog.array.peek;


/**
 * Reference to the original {@code Array.prototype}.
 * @private
 */
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;


// NOTE(arv): Since most of the array functions are generic it allows you to
// pass an array-like object. Strings have a length and are considered array-
// like. However, the 'in' operator does not work on strings so we cannot just
// use the array path even if the browser supports indexing into strings. We
// therefore end up splitting the string.


/**
 * Returns the index of the first element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-indexof}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr The array to be searched.
 * @param {T} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 * @template T
 */
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                     (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                      goog.array.ARRAY_PROTOTYPE_.indexOf) ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);

      if (goog.isString(arr)) {
        // Array.prototype.indexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Returns the index of the last element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-lastindexof}
 *
 * @param {!Array<T>|!goog.array.ArrayLike} arr The array to be searched.
 * @param {T} obj The object for which we are searching.
 * @param {?number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at the end of the array.
 * @return {number} The index of the last matching array element.
 * @template T
 */
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                         (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                          goog.array.ARRAY_PROTOTYPE_.lastIndexOf) ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      // Firefox treats undefined and null as 0 in the fromIndex argument which
      // leads it to always return -1
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
      return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;

      if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
      }

      if (goog.isString(arr)) {
        // Array.prototype.lastIndexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Calls a function for each element in an array. Skips holes in the array.
 * See {@link http://tinyurl.com/developer-mozilla-org-array-foreach}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate.
 * @param {?function(this: S, T, number, ?): ?} f The function to call for every
 *     element. This function takes 3 arguments (the element, the index and the
 *     array). The return value is ignored.
 * @param {S=} opt_obj The object to be used as the value of 'this' within f.
 * @template T,S
 */
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES &&
                     (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                      goog.array.ARRAY_PROTOTYPE_.forEach) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };


/**
 * Calls a function for each element in an array, starting from the last
 * element rather than the first.
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this: S, T, number, ?): ?} f The function to call for every
 *     element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @template T,S
 */
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-filter}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array<T>} a new array in which only elements that passed the test
 *     are present.
 * @template T,S
 */
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES &&
                    (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                     goog.array.ARRAY_PROTOTYPE_.filter) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];  // in case f mutates arr2
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-map}
 *
 * @param {Array<VALUE>|goog.array.ArrayLike} arr Array or array like object
 *     over which to iterate.
 * @param {function(this:THIS, VALUE, number, ?): RESULT} f The function to call
 *     for every element. This function takes 3 arguments (the element,
 *     the index and the array) and should return something. The result will be
 *     inserted into a new array.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within f.
 * @return {!Array<RESULT>} a new array with the results from f.
 * @template THIS, VALUE, RESULT
 */
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES &&
                 (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                  goog.array.ARRAY_PROTOTYPE_.map) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };


/**
 * Passes every element of an array into a function and accumulates the result.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduce}
 *
 * For example:
 * var a = [1, 2, 3, 4];
 * goog.array.reduce(a, function(r, v, i, arr) {return r + v;}, 0);
 * returns 10
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {function(this:S, R, T, number, ?) : R} f The function to call for
 *     every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {?} val The initial value to pass into the function on the first call.
 * @param {S=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {R} Result of evaluating f repeatedly across the values of the array.
 * @template T,S,R
 */
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES &&
                    (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                     goog.array.ARRAY_PROTOTYPE_.reduce) ?
    function(arr, f, val, opt_obj) {
      goog.asserts.assert(arr.length != null);
      if (opt_obj) {
        f = goog.bind(f, opt_obj);
      }
      return goog.array.ARRAY_PROTOTYPE_.reduce.call(arr, f, val);
    } :
    function(arr, f, val, opt_obj) {
      var rval = val;
      goog.array.forEach(arr, function(val, index) {
        rval = f.call(opt_obj, rval, val, index, arr);
      });
      return rval;
    };


/**
 * Passes every element of an array into a function and accumulates the result,
 * starting from the last element and working towards the first.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduceright}
 *
 * For example:
 * var a = ['a', 'b', 'c'];
 * goog.array.reduceRight(a, function(r, v, i, arr) {return r + v;}, '');
 * returns 'cba'
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, R, T, number, ?) : R} f The function to call for
 *     every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {?} val The initial value to pass into the function on the first call.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {R} Object returned as a result of evaluating f repeatedly across the
 *     values of the array.
 * @template T,S,R
 */
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES &&
                         (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                          goog.array.ARRAY_PROTOTYPE_.reduceRight) ?
    function(arr, f, val, opt_obj) {
      goog.asserts.assert(arr.length != null);
      if (opt_obj) {
        f = goog.bind(f, opt_obj);
      }
      return goog.array.ARRAY_PROTOTYPE_.reduceRight.call(arr, f, val);
    } :
    function(arr, f, val, opt_obj) {
      var rval = val;
      goog.array.forEachRight(arr, function(val, index) {
        rval = f.call(opt_obj, rval, val, index, arr);
      });
      return rval;
    };


/**
 * Calls f for each element of an array. If any call returns true, some()
 * returns true (without checking the remaining elements). If all calls
 * return false, some() returns false.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-some}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} true if any element passes the test.
 * @template T,S
 */
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES &&
                  (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                   goog.array.ARRAY_PROTOTYPE_.some) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return true;
        }
      }
      return false;
    };


/**
 * Call f for each element of an array. If all calls return true, every()
 * returns true. If any call returns false, every() returns false and
 * does not continue to check the remaining elements.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-every}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} false if any element fails the test.
 * @template T,S
 */
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES &&
                   (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                    goog.array.ARRAY_PROTOTYPE_.every) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return false;
        }
      }
      return true;
    };


/**
 * Counts the array elements that fulfill the predicate, i.e. for which the
 * callback function returns true. Skips holes in the array.
 *
 * @param {!(Array<T>|goog.array.ArrayLike)} arr Array or array like object
 *     over which to iterate.
 * @param {function(this: S, T, number, ?): boolean} f The function to call for
 *     every element. Takes 3 arguments (the element, the index and the array).
 * @param {S=} opt_obj The object to be used as the value of 'this' within f.
 * @return {number} The number of the matching elements.
 * @template T,S
 */
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if (f.call(opt_obj, element, index, arr)) {
      ++count;
    }
  }, opt_obj);
  return count;
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return that element.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {T|null} The first array element that passes the test, or null if no
 *     element is found.
 * @template T,S
 */
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return its index.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 * @template T,S
 */
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return that element.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {T|null} The last array element that passes the test, or null if no
 *     element is found.
 * @template T,S
 */
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return its index.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the last array element that passes the test,
 *     or -1 if no element is found.
 * @template T,S
 */
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Whether the array contains the given object.
 * @param {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};


/**
 * Whether the array is empty.
 * @param {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};


/**
 * Clears the array.
 * @param {goog.array.ArrayLike} arr Array or array like object to clear.
 */
goog.array.clear = function(arr) {
  // For non real arrays we don't have the magic length so we delete the
  // indices.
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};


/**
 * Pushes an item into an array, if it's not already in the array.
 * @param {Array<T>} arr Array into which to insert the item.
 * @param {T} obj Value to add.
 * @template T
 */
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};


/**
 * Inserts an object at the given index of the array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};


/**
 * Inserts at the given index of the array, all elements of another array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {goog.array.ArrayLike} elementsToAdd The array of elements to add.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};


/**
 * Inserts an object into an array before a specified object.
 * @param {Array<T>} arr The array to modify.
 * @param {T} obj The object to insert.
 * @param {T=} opt_obj2 The object before which obj should be inserted. If obj2
 *     is omitted or not found, obj is inserted at the end of the array.
 * @template T
 */
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {Array<T>|goog.array.ArrayLike} arr Array from which to remove
 *     value.
 * @param {T} obj Object to remove.
 * @return {boolean} True if an element was removed.
 * @template T
 */
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};


/**
 * Removes from an array the element at index i
 * @param {goog.array.ArrayLike} arr Array or array like object from which to
 *     remove value.
 * @param {number} i The index to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);

  // use generic form of splice
  // splice returns the removed items and if successful the length of that
  // will be 1
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1;
};


/**
 * Removes the first value that satisfies the given condition.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {boolean} True if an element was removed.
 * @template T,S
 */
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};


/**
 * Removes all values that satisfy the given condition.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The number of items removed
 * @template T,S
 */
goog.array.removeAllIf = function(arr, f, opt_obj) {
  var removedCount = 0;
  goog.array.forEachRight(arr, function(val, index) {
    if (f.call(opt_obj, val, index, arr)) {
      if (goog.array.removeAt(arr, index)) {
        removedCount++;
      }
    }
  });
  return removedCount;
};


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array<?>} The new resultant array.
 */
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Returns a new array that contains the contents of all the arrays passed.
 * @param {...!Array<T>} var_args
 * @return {!Array<T>}
 * @template T
 */
goog.array.join = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Converts an object to an array.
 * @param {Array<T>|goog.array.ArrayLike} object  The object to convert to an
 *     array.
 * @return {!Array<T>} The object converted into an array. If object has a
 *     length property, every property indexed with a non-negative number
 *     less than length will be included in the result. If object does not
 *     have a length property, an empty array will be returned.
 * @template T
 */
goog.array.toArray = function(object) {
  var length = object.length;

  // If length is not a number the following it false. This case is kept for
  // backwards compatibility since there are callers that pass objects that are
  // not array like.
  if (length > 0) {
    var rv = new Array(length);
    for (var i = 0; i < length; i++) {
      rv[i] = object[i];
    }
    return rv;
  }
  return [];
};


/**
 * Does a shallow copy of an array.
 * @param {Array<T>|goog.array.ArrayLike} arr  Array or array-like object to
 *     clone.
 * @return {!Array<T>} Clone of the input array.
 * @template T
 */
goog.array.clone = goog.array.toArray;


/**
 * Extends an array with another array, element, or "array like" object.
 * This function operates 'in-place', it does not create a new Array.
 *
 * Example:
 * var a = [];
 * goog.array.extend(a, [0, 1]);
 * a; // [0, 1]
 * goog.array.extend(a, 2);
 * a; // [0, 1, 2]
 *
 * @param {Array<VALUE>} arr1  The array to modify.
 * @param {...(Array<VALUE>|VALUE)} var_args The elements or arrays of elements
 *     to add to arr1.
 * @template VALUE
 */
goog.array.extend = function(arr1, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var arr2 = arguments[i];
    if (goog.isArrayLike(arr2)) {
      var len1 = arr1.length || 0;
      var len2 = arr2.length || 0;
      arr1.length = len1 + len2;
      for (var j = 0; j < len2; j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};


/**
 * Adds or removes elements from an array. This is a generic version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * such as the arguments object.
 *
 * @param {Array<T>|goog.array.ArrayLike} arr The array to modify.
 * @param {number|undefined} index The index at which to start changing the
 *     array. If not defined, treated as 0.
 * @param {number} howMany How many elements to remove (0 means no removal. A
 *     value below 0 is treated as zero and so is any other non number. Numbers
 *     are floored).
 * @param {...T} var_args Optional, additional elements to insert into the
 *     array.
 * @return {!Array<T>} the removed elements.
 * @template T
 */
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);

  return goog.array.ARRAY_PROTOTYPE_.splice.apply(
      arr, goog.array.slice(arguments, 1));
};


/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, such as the arguments object.
 *
 * @param {Array<T>|goog.array.ArrayLike} arr The array from
 * which to copy a segment.
 * @param {number} start The index of the first element to copy.
 * @param {number=} opt_end The index after the last element to copy.
 * @return {!Array<T>} A new array containing the specified segment of the
 *     original array.
 * @template T
 */
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);

  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};


/**
 * Removes all duplicates from an array (retaining only the first
 * occurrence of each array element).  This function modifies the
 * array in place and doesn't change the order of the non-duplicate items.
 *
 * For objects, duplicates are identified as having the same unique ID as
 * defined by {@link goog.getUid}.
 *
 * Alternatively you can specify a custom hash function that returns a unique
 * value for each item in the array it should consider unique.
 *
 * Runtime: N,
 * Worstcase space: 2N (no dupes)
 *
 * @param {Array<T>|goog.array.ArrayLike} arr The array from which to remove
 *     duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 * @param {function(T):string=} opt_hashFn An optional function to use to
 *     apply to every item in the array. This function should return a unique
 *     value for each item in the array it should consider unique.
 * @template T
 */
goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
  var returnArray = opt_rv || arr;
  var defaultHashFn = function(item) {
    // Prefix each type with a single character representing the type to
    // prevent conflicting keys (e.g. true and 'true').
    return goog.isObject(item) ? 'o' + goog.getUid(item) :
        (typeof item).charAt(0) + item;
  };
  var hashFn = opt_hashFn || defaultHashFn;

  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = hashFn(current);
    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current;
    }
  }
  returnArray.length = cursorInsert;
};


/**
 * Searches the specified array for the specified target using the binary
 * search algorithm.  If no opt_compareFn is specified, elements are compared
 * using <code>goog.array.defaultCompare</code>, which compares the elements
 * using the built in < and > operators.  This will produce the expected
 * behavior for homogeneous arrays of String(s) and Number(s). The array
 * specified <b>must</b> be sorted in ascending order (as defined by the
 * comparison function).  If the array is not sorted, results are undefined.
 * If the array contains multiple instances of the specified target value, any
 * of these instances may be found.
 *
 * Runtime: O(log n)
 *
 * @param {Array<VALUE>|goog.array.ArrayLike} arr The array to be searched.
 * @param {TARGET} target The sought value.
 * @param {function(TARGET, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @template TARGET, VALUE
 */
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr,
      opt_compareFn || goog.array.defaultCompare, false /* isEvaluator */,
      target);
};


/**
 * Selects an index in the specified array using the binary search algorithm.
 * The evaluator receives an element and determines whether the desired index
 * is before, at, or after it.  The evaluator must be consistent (formally,
 * goog.array.map(goog.array.map(arr, evaluator, opt_obj), goog.math.sign)
 * must be monotonically non-increasing).
 *
 * Runtime: O(log n)
 *
 * @param {Array<VALUE>|goog.array.ArrayLike} arr The array to be searched.
 * @param {function(this:THIS, VALUE, number, ?): number} evaluator
 *     Evaluator function that receives 3 arguments (the element, the index and
 *     the array). Should return a negative number, zero, or a positive number
 *     depending on whether the desired index is before, at, or after the
 *     element passed to it.
 * @param {THIS=} opt_obj The object to be used as the value of 'this'
 *     within evaluator.
 * @return {number} Index of the leftmost element matched by the evaluator, if
 *     such exists; otherwise (-(insertion point) - 1). The insertion point is
 *     the index of the first element for which the evaluator returns negative,
 *     or arr.length if no such element exists. The return value is non-negative
 *     iff a match is found.
 * @template THIS, VALUE
 */
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true /* isEvaluator */,
      undefined /* opt_target */, opt_obj);
};


/**
 * Implementation of a binary search algorithm which knows how to use both
 * comparison functions and evaluators. If an evaluator is provided, will call
 * the evaluator with the given optional data object, conforming to the
 * interface defined in binarySelect. Otherwise, if a comparison function is
 * provided, will call the comparison function against the given data object.
 *
 * This implementation purposefully does not use goog.bind or goog.partial for
 * performance reasons.
 *
 * Runtime: O(log n)
 *
 * @param {Array<VALUE>|goog.array.ArrayLike} arr The array to be searched.
 * @param {function(TARGET, VALUE): number|
 *         function(this:THIS, VALUE, number, ?): number} compareFn Either an
 *     evaluator or a comparison function, as defined by binarySearch
 *     and binarySelect above.
 * @param {boolean} isEvaluator Whether the function is an evaluator or a
 *     comparison function.
 * @param {TARGET=} opt_target If the function is a comparison function, then
 *     this is the target to binary search for.
 * @param {THIS=} opt_selfObj If the function is an evaluator, this is an
  *    optional this object for the evaluator.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @template THIS, VALUE, TARGET
 * @private
 */
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target,
    opt_selfObj) {
  var left = 0;  // inclusive
  var right = arr.length;  // exclusive
  var found;
  while (left < right) {
    var middle = (left + right) >> 1;
    var compareResult;
    if (isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
    } else {
      compareResult = compareFn(opt_target, arr[middle]);
    }
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      // We are looking for the lowest index so we can't return immediately.
      found = !compareResult;
    }
  }
  // left is the index if found, or the insertion point otherwise.
  // ~left is a shorthand for -left - 1.
  return found ? left : ~left;
};


/**
 * Sorts the specified array into ascending order.  If no opt_compareFn is
 * specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s), unlike the native sort,
 * but will give unpredictable results for heterogenous lists of strings and
 * numbers with different numbers of digits.
 *
 * This sort is not guaranteed to be stable.
 *
 * Runtime: Same as <code>Array.prototype.sort</code>
 *
 * @param {Array<T>} arr The array to be sorted.
 * @param {?function(T,T):number=} opt_compareFn Optional comparison
 *     function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @template T
 */
goog.array.sort = function(arr, opt_compareFn) {
  // TODO(arv): Update type annotation since null is not accepted.
  arr.sort(opt_compareFn || goog.array.defaultCompare);
};


/**
 * Sorts the specified array into ascending order in a stable way.  If no
 * opt_compareFn is specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s).
 *
 * Runtime: Same as <code>Array.prototype.sort</code>, plus an additional
 * O(n) overhead of copying the array twice.
 *
 * @param {Array<T>} arr The array to be sorted.
 * @param {?function(T, T): number=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @template T
 */
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = {index: i, value: arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  };
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].value;
  }
};


/**
 * Sort the specified array into ascending order based on item keys
 * returned by the specified key function.
 * If no opt_compareFn is specified, the keys are compared in ascending order
 * using <code>goog.array.defaultCompare</code>.
 *
 * Runtime: O(S(f(n)), where S is runtime of <code>goog.array.sort</code>
 * and f(n) is runtime of the key function.
 *
 * @param {Array<T>} arr The array to be sorted.
 * @param {function(T): K} keyFn Function taking array element and returning
 *     a key used for sorting this element.
 * @param {?function(K, K): number=} opt_compareFn Optional comparison function
 *     by which the keys are to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @template T,K
 */
goog.array.sortByKey = function(arr, keyFn, opt_compareFn) {
  var keyCompareFn = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return keyCompareFn(keyFn(a), keyFn(b));
  });
};


/**
 * Sorts an array of objects by the specified object key and compare
 * function. If no compare function is provided, the key values are
 * compared in ascending order using <code>goog.array.defaultCompare</code>.
 * This won't work for keys that get renamed by the compiler. So use
 * {'foo': 1, 'bar': 2} rather than {foo: 1, bar: 2}.
 * @param {Array<Object>} arr An array of objects to sort.
 * @param {string} key The object key to sort by.
 * @param {Function=} opt_compareFn The function to use to compare key
 *     values.
 */
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  goog.array.sortByKey(arr,
      function(obj) { return obj[key]; },
      opt_compareFn);
};


/**
 * Tells if the array is sorted.
 * @param {!Array<T>} arr The array.
 * @param {?function(T,T):number=} opt_compareFn Function to compare the
 *     array elements.
 *     Should take 2 arguments to compare, and return a negative number, zero,
 *     or a positive number depending on whether the first argument is less
 *     than, equal to, or greater than the second.
 * @param {boolean=} opt_strict If true no equal elements are allowed.
 * @return {boolean} Whether the array is sorted.
 * @template T
 */
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for (var i = 1; i < arr.length; i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (compareResult > 0 || compareResult == 0 && opt_strict) {
      return false;
    }
  }
  return true;
};


/**
 * Compares two arrays for equality. Two arrays are considered equal if they
 * have the same length and their corresponding elements are equal according to
 * the comparison function.
 *
 * @param {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length != arr2.length) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};


/**
 * 3-way array compare function.
 * @param {!Array<VALUE>|!goog.array.ArrayLike} arr1 The first array to
 *     compare.
 * @param {!Array<VALUE>|!goog.array.ArrayLike} arr2 The second array to
 *     compare.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is to be ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {number} Negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @template VALUE
 */
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for (var i = 0; i < l; i++) {
    var result = compare(arr1[i], arr2[i]);
    if (result != 0) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};


/**
 * Compares its two arguments for order, using the built in < and >
 * operators.
 * @param {VALUE} a The first object to be compared.
 * @param {VALUE} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is less than, equal to, or greater than the second,
 *     respectively.
 * @template VALUE
 */
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};


/**
 * Compares its two arguments for inverse order, using the built in < and >
 * operators.
 * @param {VALUE} a The first object to be compared.
 * @param {VALUE} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is greater than, equal to, or less than the second,
 *     respectively.
 * @template VALUE
 */
goog.array.inverseDefaultCompare = function(a, b) {
  return -goog.array.defaultCompare(a, b);
};


/**
 * Compares its two arguments for equality, using the built in === operator.
 * @param {*} a The first object to compare.
 * @param {*} b The second object to compare.
 * @return {boolean} True if the two arguments are equal, false otherwise.
 */
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};


/**
 * Inserts a value into a sorted array. The array is not modified if the
 * value is already present.
 * @param {Array<VALUE>|goog.array.ArrayLike} array The array to modify.
 * @param {VALUE} value The object to insert.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {boolean} True if an element was inserted.
 * @template VALUE
 */
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};


/**
 * Removes a value from a sorted array.
 * @param {!Array<VALUE>|!goog.array.ArrayLike} array The array to modify.
 * @param {VALUE} value The object to remove.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {boolean} True if an element was removed.
 * @template VALUE
 */
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return (index >= 0) ? goog.array.removeAt(array, index) : false;
};


/**
 * Splits an array into disjoint buckets according to a splitting function.
 * @param {Array<T>} array The array.
 * @param {function(this:S, T,number,Array<T>):?} sorter Function to call for
 *     every element.  This takes 3 arguments (the element, the index and the
 *     array) and must return a valid object key (a string, number, etc), or
 *     undefined, if that object should not be placed in a bucket.
 * @param {S=} opt_obj The object to be used as the value of 'this' within
 *     sorter.
 * @return {!Object} An object, with keys being all of the unique return values
 *     of sorter, and values being arrays containing the items for
 *     which the splitter returned that key.
 * @template T,S
 */
goog.array.bucket = function(array, sorter, opt_obj) {
  var buckets = {};

  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var key = sorter.call(opt_obj, value, i, array);
    if (goog.isDef(key)) {
      // Push the value to the right bucket, creating it if necessary.
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }

  return buckets;
};


/**
 * Creates a new object built from the provided array and the key-generation
 * function.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate whose elements will be the values in the new object.
 * @param {?function(this:S, T, number, ?) : string} keyFunc The function to
 *     call for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a string that will be used as the
 *     key for the element in the new object. If the function returns the same
 *     key for more than one element, the value for that key is
 *     implementation-defined.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within keyFunc.
 * @return {!Object<T>} The new object.
 * @template T,S
 */
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element;
  });
  return ret;
};


/**
 * Creates a range of numbers in an arithmetic progression.
 *
 * Range takes 1, 2, or 3 arguments:
 * <pre>
 * range(5) is the same as range(0, 5, 1) and produces [0, 1, 2, 3, 4]
 * range(2, 5) is the same as range(2, 5, 1) and produces [2, 3, 4]
 * range(-2, -5, -1) produces [-2, -3, -4]
 * range(-2, -5, 1) produces [], since stepping by 1 wouldn't ever reach -5.
 * </pre>
 *
 * @param {number} startOrEnd The starting value of the range if an end argument
 *     is provided. Otherwise, the start value is 0, and this is the end value.
 * @param {number=} opt_end The optional end value of the range.
 * @param {number=} opt_step The step size between range values. Defaults to 1
 *     if opt_step is undefined or 0.
 * @return {!Array<number>} An array of numbers for the requested range. May be
 *     an empty array if adding the step would not converge toward the end
 *     value.
 */
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [];
  var start = 0;
  var end = startOrEnd;
  var step = opt_step || 1;
  if (opt_end !== undefined) {
    start = startOrEnd;
    end = opt_end;
  }

  if (step * (end - start) < 0) {
    // Sign mismatch: start + step will never reach the end value.
    return [];
  }

  if (step > 0) {
    for (var i = start; i < end; i += step) {
      array.push(i);
    }
  } else {
    for (var i = start; i > end; i += step) {
      array.push(i);
    }
  }
  return array;
};


/**
 * Returns an array consisting of the given value repeated N times.
 *
 * @param {VALUE} value The value to repeat.
 * @param {number} n The repeat count.
 * @return {!Array<VALUE>} An array with the repeated value.
 * @template VALUE
 */
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};


/**
 * Returns an array consisting of every argument with all arrays
 * expanded in-place recursively.
 *
 * @param {...*} var_args The values to flatten.
 * @return {!Array<?>} An array containing the flattened values.
 */
goog.array.flatten = function(var_args) {
  var CHUNK_SIZE = 8192;

  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      for (var c = 0; c < element.length; c += CHUNK_SIZE) {
        var chunk = goog.array.slice(element, c, c + CHUNK_SIZE);
        var recurseResult = goog.array.flatten.apply(null, chunk);
        for (var r = 0; r < recurseResult.length; r++) {
          result.push(recurseResult[r]);
        }
      }
    } else {
      result.push(element);
    }
  }
  return result;
};


/**
 * Rotates an array in-place. After calling this method, the element at
 * index i will be the element previously at index (i - n) %
 * array.length, for all values of i between 0 and array.length - 1,
 * inclusive.
 *
 * For example, suppose list comprises [t, a, n, k, s]. After invoking
 * rotate(array, 1) (or rotate(array, -4)), array will comprise [s, t, a, n, k].
 *
 * @param {!Array<T>} array The array to rotate.
 * @param {number} n The amount to rotate.
 * @return {!Array<T>} The array.
 * @template T
 */
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);

  if (array.length) {
    n %= array.length;
    if (n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n));
    } else if (n < 0) {
      goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n));
    }
  }
  return array;
};


/**
 * Moves one item of an array to a new position keeping the order of the rest
 * of the items. Example use case: keeping a list of JavaScript objects
 * synchronized with the corresponding list of DOM elements after one of the
 * elements has been dragged to a new position.
 * @param {!(Array|Arguments|{length:number})} arr The array to modify.
 * @param {number} fromIndex Index of the item to move between 0 and
 *     {@code arr.length - 1}.
 * @param {number} toIndex Target index between 0 and {@code arr.length - 1}.
 */
goog.array.moveItem = function(arr, fromIndex, toIndex) {
  goog.asserts.assert(fromIndex >= 0 && fromIndex < arr.length);
  goog.asserts.assert(toIndex >= 0 && toIndex < arr.length);
  // Remove 1 item at fromIndex.
  var removedItems = goog.array.ARRAY_PROTOTYPE_.splice.call(arr, fromIndex, 1);
  // Insert the removed item at toIndex.
  goog.array.ARRAY_PROTOTYPE_.splice.call(arr, toIndex, 0, removedItems[0]);
  // We don't use goog.array.insertAt and goog.array.removeAt, because they're
  // significantly slower than splice.
};


/**
 * Creates a new array for which the element at position i is an array of the
 * ith element of the provided arrays.  The returned array will only be as long
 * as the shortest array provided; additional values are ignored.  For example,
 * the result of zipping [1, 2] and [3, 4, 5] is [[1,3], [2, 4]].
 *
 * This is similar to the zip() function in Python.  See {@link
 * http://docs.python.org/library/functions.html#zip}
 *
 * @param {...!goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array<!Array<?>>} A new array of arrays created from
 *     provided arrays.
 */
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  var result = [];
  for (var i = 0; true; i++) {
    var value = [];
    for (var j = 0; j < arguments.length; j++) {
      var arr = arguments[j];
      // If i is larger than the array length, this is the shortest array.
      if (i >= arr.length) {
        return result;
      }
      value.push(arr[i]);
    }
    result.push(value);
  }
};


/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle). By default, calls Math.random()
 * and so resets the state of that random number generator. Similarly, may reset
 * the state of the any other specified random number generator.
 *
 * Runtime: O(n)
 *
 * @param {!Array<?>} arr The array to be shuffled.
 * @param {function():number=} opt_randFn Optional random function to use for
 *     shuffling.
 *     Takes no arguments, and returns a random number on the interval [0, 1).
 *     Defaults to Math.random() using JavaScript's built-in Math library.
 */
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;

  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(randFn() * (i + 1));

    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};


/**
 * Returns a new array of elements from arr, based on the indexes of elements
 * provided by index_arr. For example, the result of index copying
 * ['a', 'b', 'c'] with index_arr [1,0,0,2] is ['b', 'a', 'a', 'c'].
 *
 * @param {!Array<T>} arr The array to get a indexed copy from.
 * @param {!Array<number>} index_arr An array of indexes to get from arr.
 * @return {!Array<T>} A new array of elements from arr in index_arr order.
 * @template T
 */
goog.array.copyByIndex = function(arr, index_arr) {
  var result = [];
  goog.array.forEach(index_arr, function(index) {
    result.push(arr[index]);
  });
  return result;
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities used by goog.labs.userAgent tools. These functions
 * should not be used outside of goog.labs.userAgent.*.
 *
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.labs.userAgent.util');

goog.require('goog.string');


/**
 * Gets the native userAgent string from navigator if it exists.
 * If navigator or navigator.userAgent string is missing, returns an empty
 * string.
 * @return {string}
 * @private
 */
goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
  var navigator = goog.labs.userAgent.util.getNavigator_();
  if (navigator) {
    var userAgent = navigator.userAgent;
    if (userAgent) {
      return userAgent;
    }
  }
  return '';
};


/**
 * Getter for the native navigator.
 * This is a separate function so it can be stubbed out in testing.
 * @return {Navigator}
 * @private
 */
goog.labs.userAgent.util.getNavigator_ = function() {
  return goog.global.navigator;
};


/**
 * A possible override for applications which wish to not check
 * navigator.userAgent but use a specified value for detection instead.
 * @private {string}
 */
goog.labs.userAgent.util.userAgent_ =
    goog.labs.userAgent.util.getNativeUserAgentString_();


/**
 * Applications may override browser detection on the built in
 * navigator.userAgent object by setting this string. Set to null to use the
 * browser object instead.
 * @param {?string=} opt_userAgent The User-Agent override.
 */
goog.labs.userAgent.util.setUserAgent = function(opt_userAgent) {
  goog.labs.userAgent.util.userAgent_ = opt_userAgent ||
      goog.labs.userAgent.util.getNativeUserAgentString_();
};


/**
 * @return {string} The user agent string.
 */
goog.labs.userAgent.util.getUserAgent = function() {
  return goog.labs.userAgent.util.userAgent_;
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string, ignoring
 *     case.
 */
goog.labs.userAgent.util.matchUserAgent = function(str) {
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.contains(userAgent, str);
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string.
 */
goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(str) {
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.caseInsensitiveContains(userAgent, str);
};


/**
 * Parses the user agent into tuples for each section.
 * @param {string} userAgent
 * @return {!Array<!Array<string>>} Tuples of key, version, and the contents
 *     of the parenthetical.
 */
goog.labs.userAgent.util.extractVersionTuples = function(userAgent) {
  // Matches each section of a user agent string.
  // Example UA:
  // Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us)
  // AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405
  // This has three version tuples: Mozilla, AppleWebKit, and Mobile.

  var versionRegExp = new RegExp(
      // Key. Note that a key may have a space.
      // (i.e. 'Mobile Safari' in 'Mobile Safari/5.0')
      '(\\w[\\w ]+)' +

      '/' +                // slash
      '([^\\s]+)' +        // version (i.e. '5.0b')
      '\\s*' +             // whitespace
      '(?:\\((.*?)\\))?',  // parenthetical info. parentheses not matched.
      'g');

  var data = [];
  var match;

  // Iterate and collect the version tuples.  Each iteration will be the
  // next regex match.
  while (match = versionRegExp.exec(userAgent)) {
    data.push([
      match[1],  // key
      match[2],  // value
      // || undefined as this is not undefined in IE7 and IE8
      match[3] || undefined  // info
    ]);
  }

  return data;
};


// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object<K,V>):?} f The function to call
 *     for every element. This function takes 3 arguments (the value, the
 *     key and the object) and the return value is ignored.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @template T,K,V
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object<K,V>):boolean} f The function to call
 *     for every element. This
 *     function takes 3 arguments (the value, the key and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the
 *     element is not included.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object<K,V>} a new object in which only elements that passed the
 *     test are present.
 * @template T,K,V
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object<K,V>):R} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the value, the key and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object<K,R>} a new object with the results from f.
 * @template T,K,V,R
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 *
 * @param {Object<K,V>} obj The object to check.
 * @param {function(this:T,V,?,Object<K,V>):boolean} f The function to
 *     call for every element. This function
 *     takes 3 arguments (the value, the key and the object) and should
 *     return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 * @template T,K,V
 */
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 *
 * @param {Object<K,V>} obj The object to check.
 * @param {?function(this:T,V,?,Object<K,V>):boolean} f The function to
 *     call for every element. This function
 *     takes 3 arguments (the value, the key and the object) and should
 *     return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 * @template T,K,V
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};


/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object<K,V>} obj The object to pick a value from.
 * @return {V|undefined} The value or undefined if the object is empty.
 * @template K,V
 */
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object<K,V>} obj The object in which to look for val.
 * @param {V} val The object for which to check.
 * @return {boolean} true if val is present.
 * @template K,V
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object<K,V>} obj The object from which to get the values.
 * @return {!Array<V>} The values in the object/map/hash.
 * @template K,V
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Get a value from an object multiple levels deep.  This is useful for
 * pulling values from deeply nested objects, such as JSON responses.
 * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
 *
 * @param {!Object} obj An object to get the value from.  Can be array-like.
 * @param {...(string|number|!Array<number|string>)} var_args A number of keys
 *     (as strings, or numbers, for array-like objects).  Can also be
 *     specified as a single array of keys.
 * @return {*} The resulting value.  If, at any point, the value for a key
 *     is undefined, returns undefined.
 */
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;

  // Start with the 2nd parameter for the variable parameters syntax.
  for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }

  return obj;
};


/**
 * Whether the object/map/hash contains the given key.
 *
 * @param {Object} obj The object in which to look for key.
 * @param {*} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
goog.object.containsKey = function(obj, key) {
  return key in obj;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object<K,V>} obj The object in which to look for val.
 * @param {V} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 * @template K,V
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {Object<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,Object<K,V>):boolean} f The
 *      function to call for every element. Takes 3 arguments (the value,
 *     the key and the object) and should return a boolean.
 * @param {T=} opt_this An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 * @template T,K,V
 */
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {Object<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,Object<K,V>):boolean} f The function
 *     to call for every element. Takes 3 arguments (the value, the key
 *     and the object) and should return a boolean.
 * @param {T=} opt_this An optional "this" context for the function.
 * @return {V} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 * @template T,K,V
 */
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {*} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} val The value to add.
 * @template K,V
 */
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object<K,V>} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {R=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {V|R|undefined} The value for the given key.
 * @template K,V,R
 */
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add.
 * @template K,V
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 *
 * @param {Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add if the key wasn't present.
 * @return {V} The value of the entry at the end of the function.
 * @template K,V
 */
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : (obj[key] = value);
};


/**
 * Sets a key and value to an object if the key is not set. The value will be
 * the return value of the given function. If the key already exists, the
 * object will not be changed and the function will not be called (the function
 * will be lazily evaluated -- only called if necessary).
 *
 * This function is particularly useful for use with a map used a as a cache.
 *
 * @param {!Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {function():V} f The value to add if the key wasn't present.
 * @return {V} The value of the entry at the end of the function.
 * @template K,V
 */
goog.object.setWithReturnValueIfNotSet = function(obj, key, f) {
  if (key in obj) {
    return obj[key];
  }

  var val = f();
  obj[key] = val;
  return val;
};


/**
 * Compares two objects for equality using === on the values.
 *
 * @param {!Object<K,V>} a
 * @param {!Object<K,V>} b
 * @return {boolean}
 * @template K,V
 */
goog.object.equals = function(a, b) {
  for (var k in a) {
    if (!(k in b) || a[k] !== b[k]) {
      return false;
    }
  }
  for (var k in b) {
    if (!(k in a)) {
      return false;
    }
  }
  return true;
};


/**
 * Does a flat clone of the object.
 *
 * @param {Object<K,V>} obj Object to clone.
 * @return {!Object<K,V>} Clone of the input object.
 * @template K,V
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.object.unsafeClone</code> does not detect reference loops. Objects
 * that refer to themselves will cause infinite recursion.
 *
 * <code>goog.object.unsafeClone</code> is unaware of unique identifiers, and
 * copies UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 */
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (goog.isFunction(obj.clone)) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {b: 2, c: 3});
 * o; // {a: 0, b: 2, c: 3}
 *
 * @param {Object} target The object to modify. Existing properties will be
 *     overwritten if they are also present in one of the objects in
 *     {@code var_args}.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};


/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise the arguments are used
 *     as the property names.
 * @return {!Object} The new object.
 */
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }

  var rv = {};
  for (var i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};


/**
 * Creates an immutable view of the underlying object, if the browser
 * supports immutable objects.
 *
 * In default mode, writes to this view will fail silently. In strict mode,
 * they will throw an error.
 *
 * @param {!Object<K,V>} obj An object.
 * @return {!Object<K,V>} An immutable view of that object, or the
 *     original object if this browser does not support immutables.
 * @template K,V
 */
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if (Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result);
  }
  return result;
};


/**
 * @param {!Object} obj An object.
 * @return {boolean} Whether this is an immutable view of the object.
 */
goog.object.isImmutableView = function(obj) {
  return !!Object.isFrozen && Object.isFrozen(obj);
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Closure user agent detection (Browser).
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on rendering engine, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent, goog.labs.userAgent.platform,
 * goog.labs.userAgent.device respectively.)
 *
 * @author martone@google.com (Andy Martone)
 */

goog.provide('goog.labs.userAgent.browser');

goog.require('goog.array');
goog.require('goog.labs.userAgent.util');
goog.require('goog.object');
goog.require('goog.string');


// TODO(nnaze): Refactor to remove excessive exclusion logic in matching
// functions.


/**
 * @return {boolean} Whether the user's browser is Opera.
 * @private
 */
goog.labs.userAgent.browser.matchOpera_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Opera') ||
      goog.labs.userAgent.util.matchUserAgent('OPR');
};


/**
 * @return {boolean} Whether the user's browser is IE.
 * @private
 */
goog.labs.userAgent.browser.matchIE_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Trident') ||
      goog.labs.userAgent.util.matchUserAgent('MSIE');
};


/**
 * @return {boolean} Whether the user's browser is Edge.
 * @private
 */
goog.labs.userAgent.browser.matchEdge_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Edge');
};


/**
 * @return {boolean} Whether the user's browser is Firefox.
 * @private
 */
goog.labs.userAgent.browser.matchFirefox_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Firefox');
};


/**
 * @return {boolean} Whether the user's browser is Safari.
 * @private
 */
goog.labs.userAgent.browser.matchSafari_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Safari') &&
      !(goog.labs.userAgent.browser.matchChrome_() ||
        goog.labs.userAgent.browser.matchCoast_() ||
        goog.labs.userAgent.browser.matchOpera_() ||
        goog.labs.userAgent.browser.matchEdge_() ||
        goog.labs.userAgent.browser.isSilk() ||
        goog.labs.userAgent.util.matchUserAgent('Android'));
};


/**
 * @return {boolean} Whether the user's browser is Coast (Opera's Webkit-based
 *     iOS browser).
 * @private
 */
goog.labs.userAgent.browser.matchCoast_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Coast');
};


/**
 * @return {boolean} Whether the user's browser is iOS Webview.
 * @private
 */
goog.labs.userAgent.browser.matchIosWebview_ = function() {
  // iOS Webview does not show up as Chrome or Safari. Also check for Opera's
  // WebKit-based iOS browser, Coast.
  return (goog.labs.userAgent.util.matchUserAgent('iPad') ||
          goog.labs.userAgent.util.matchUserAgent('iPhone')) &&
      !goog.labs.userAgent.browser.matchSafari_() &&
      !goog.labs.userAgent.browser.matchChrome_() &&
      !goog.labs.userAgent.browser.matchCoast_() &&
      goog.labs.userAgent.util.matchUserAgent('AppleWebKit');
};


/**
 * @return {boolean} Whether the user's browser is Chrome.
 * @private
 */
goog.labs.userAgent.browser.matchChrome_ = function() {
  return (goog.labs.userAgent.util.matchUserAgent('Chrome') ||
      goog.labs.userAgent.util.matchUserAgent('CriOS')) &&
      !goog.labs.userAgent.browser.matchOpera_() &&
      !goog.labs.userAgent.browser.matchEdge_();
};


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 * @private
 */
goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
  // Android can appear in the user agent string for Chrome on Android.
  // This is not the Android standalone browser if it does.
  return goog.labs.userAgent.util.matchUserAgent('Android') &&
      !(goog.labs.userAgent.browser.isChrome() ||
        goog.labs.userAgent.browser.isFirefox() ||
        goog.labs.userAgent.browser.isOpera() ||
        goog.labs.userAgent.browser.isSilk());
};


/**
 * @return {boolean} Whether the user's browser is Opera.
 */
goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;


/**
 * @return {boolean} Whether the user's browser is IE.
 */
goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;


/**
 * @return {boolean} Whether the user's browser is Edge.
 */
goog.labs.userAgent.browser.isEdge = goog.labs.userAgent.browser.matchEdge_;


/**
 * @return {boolean} Whether the user's browser is Firefox.
 */
goog.labs.userAgent.browser.isFirefox =
    goog.labs.userAgent.browser.matchFirefox_;


/**
 * @return {boolean} Whether the user's browser is Safari.
 */
goog.labs.userAgent.browser.isSafari =
    goog.labs.userAgent.browser.matchSafari_;


/**
 * @return {boolean} Whether the user's browser is Coast (Opera's Webkit-based
 *     iOS browser).
 */
goog.labs.userAgent.browser.isCoast =
    goog.labs.userAgent.browser.matchCoast_;


/**
 * @return {boolean} Whether the user's browser is iOS Webview.
 */
goog.labs.userAgent.browser.isIosWebview =
    goog.labs.userAgent.browser.matchIosWebview_;


/**
 * @return {boolean} Whether the user's browser is Chrome.
 */
goog.labs.userAgent.browser.isChrome =
    goog.labs.userAgent.browser.matchChrome_;


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 */
goog.labs.userAgent.browser.isAndroidBrowser =
    goog.labs.userAgent.browser.matchAndroidBrowser_;


/**
 * For more information, see:
 * http://docs.aws.amazon.com/silk/latest/developerguide/user-agent.html
 * @return {boolean} Whether the user's browser is Silk.
 */
goog.labs.userAgent.browser.isSilk = function() {
  return goog.labs.userAgent.util.matchUserAgent('Silk');
};


/**
 * @return {string} The browser version or empty string if version cannot be
 *     determined. Note that for Internet Explorer, this returns the version of
 *     the browser, not the version of the rendering engine. (IE 8 in
 *     compatibility mode will return 8.0 rather than 7.0. To determine the
 *     rendering engine version, look at document.documentMode instead. See
 *     http://msdn.microsoft.com/en-us/library/cc196988(v=vs.85).aspx for more
 *     details.)
 */
goog.labs.userAgent.browser.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  // Special case IE since IE's version is inside the parenthesis and
  // without the '/'.
  if (goog.labs.userAgent.browser.isIE()) {
    return goog.labs.userAgent.browser.getIEVersion_(userAgentString);
  }

  var versionTuples = goog.labs.userAgent.util.extractVersionTuples(
      userAgentString);

  // Construct a map for easy lookup.
  var versionMap = {};
  goog.array.forEach(versionTuples, function(tuple) {
    // Note that the tuple is of length three, but we only care about the
    // first two.
    var key = tuple[0];
    var value = tuple[1];
    versionMap[key] = value;
  });

  var versionMapHasKey = goog.partial(goog.object.containsKey, versionMap);

  // Gives the value with the first key it finds, otherwise empty string.
  function lookUpValueWithKeys(keys) {
    var key = goog.array.find(keys, versionMapHasKey);
    return versionMap[key] || '';
  }

  // Check Opera before Chrome since Opera 15+ has "Chrome" in the string.
  // See
  // http://my.opera.com/ODIN/blog/2013/07/15/opera-user-agent-strings-opera-15-and-beyond
  if (goog.labs.userAgent.browser.isOpera()) {
    // Opera 10 has Version/10.0 but Opera/9.8, so look for "Version" first.
    // Opera uses 'OPR' for more recent UAs.
    return lookUpValueWithKeys(['Version', 'Opera', 'OPR']);
  }

  // Check Edge before Chrome since it has Chrome in the string.
  if (goog.labs.userAgent.browser.isEdge()) {
    return lookUpValueWithKeys(['Edge']);
  }

  if (goog.labs.userAgent.browser.isChrome()) {
    return lookUpValueWithKeys(['Chrome', 'CriOS']);
  }

  // Usually products browser versions are in the third tuple after "Mozilla"
  // and the engine.
  var tuple = versionTuples[2];
  return tuple && tuple[1] || '';
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 */
goog.labs.userAgent.browser.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.browser.getVersion(),
                                     version) >= 0;
};


/**
 * Determines IE version. More information:
 * http://msdn.microsoft.com/en-us/library/ie/bg182625(v=vs.85).aspx#uaString
 * http://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
 * http://blogs.msdn.com/b/ie/archive/2010/03/23/introducing-ie9-s-user-agent-string.aspx
 * http://blogs.msdn.com/b/ie/archive/2009/01/09/the-internet-explorer-8-user-agent-string-updated-edition.aspx
 *
 * @param {string} userAgent the User-Agent.
 * @return {string}
 * @private
 */
goog.labs.userAgent.browser.getIEVersion_ = function(userAgent) {
  // IE11 may identify itself as MSIE 9.0 or MSIE 10.0 due to an IE 11 upgrade
  // bug. Example UA:
  // Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; WOW64; Trident/7.0; rv:11.0)
  // like Gecko.
  // See http://www.whatismybrowser.com/developers/unknown-user-agent-fragments.
  var rv = /rv: *([\d\.]*)/.exec(userAgent);
  if (rv && rv[1]) {
    return rv[1];
  }

  var version = '';
  var msie = /MSIE +([\d\.]+)/.exec(userAgent);
  if (msie && msie[1]) {
    // IE in compatibility mode usually identifies itself as MSIE 7.0; in this
    // case, use the Trident version to determine the version of IE. For more
    // details, see the links above.
    var tridentVersion = /Trident\/(\d.\d)/.exec(userAgent);
    if (msie[1] == '7.0') {
      if (tridentVersion && tridentVersion[1]) {
        switch (tridentVersion[1]) {
          case '4.0':
            version = '8.0';
            break;
          case '5.0':
            version = '9.0';
            break;
          case '6.0':
            version = '10.0';
            break;
          case '7.0':
            version = '11.0';
            break;
        }
      } else {
        version = '7.0';
      }
    } else {
      version = msie[1];
    }
  }
  return version;
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Closure user agent platform detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on browser brand, rendering engine, or device see the
 * other sub-namespaces in goog.labs.userAgent (browser, engine, and device
 * respectively).
 *
 */

goog.provide('goog.labs.userAgent.platform');

goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @return {boolean} Whether the platform is Android.
 */
goog.labs.userAgent.platform.isAndroid = function() {
  return goog.labs.userAgent.util.matchUserAgent('Android');
};


/**
 * @return {boolean} Whether the platform is iPod.
 */
goog.labs.userAgent.platform.isIpod = function() {
  return goog.labs.userAgent.util.matchUserAgent('iPod');
};


/**
 * @return {boolean} Whether the platform is iPhone.
 */
goog.labs.userAgent.platform.isIphone = function() {
  return goog.labs.userAgent.util.matchUserAgent('iPhone') &&
      !goog.labs.userAgent.util.matchUserAgent('iPod') &&
      !goog.labs.userAgent.util.matchUserAgent('iPad');
};


/**
 * @return {boolean} Whether the platform is iPad.
 */
goog.labs.userAgent.platform.isIpad = function() {
  return goog.labs.userAgent.util.matchUserAgent('iPad');
};


/**
 * @return {boolean} Whether the platform is iOS.
 */
goog.labs.userAgent.platform.isIos = function() {
  return goog.labs.userAgent.platform.isIphone() ||
      goog.labs.userAgent.platform.isIpad() ||
      goog.labs.userAgent.platform.isIpod();
};


/**
 * @return {boolean} Whether the platform is Mac.
 */
goog.labs.userAgent.platform.isMacintosh = function() {
  return goog.labs.userAgent.util.matchUserAgent('Macintosh');
};


/**
 * Note: ChromeOS is not considered to be Linux as it does not report itself
 * as Linux in the user agent string.
 * @return {boolean} Whether the platform is Linux.
 */
goog.labs.userAgent.platform.isLinux = function() {
  return goog.labs.userAgent.util.matchUserAgent('Linux');
};


/**
 * @return {boolean} Whether the platform is Windows.
 */
goog.labs.userAgent.platform.isWindows = function() {
  return goog.labs.userAgent.util.matchUserAgent('Windows');
};


/**
 * @return {boolean} Whether the platform is ChromeOS.
 */
goog.labs.userAgent.platform.isChromeOS = function() {
  return goog.labs.userAgent.util.matchUserAgent('CrOS');
};


/**
 * The version of the platform. We only determine the version for Windows,
 * Mac, and Chrome OS. It doesn't make much sense on Linux. For Windows, we only
 * look at the NT version. Non-NT-based versions (e.g. 95, 98, etc.) are given
 * version 0.0.
 *
 * @return {string} The platform version or empty string if version cannot be
 *     determined.
 */
goog.labs.userAgent.platform.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  var version = '', re;
  if (goog.labs.userAgent.platform.isWindows()) {
    re = /Windows (?:NT|Phone) ([0-9.]+)/;
    var match = re.exec(userAgentString);
    if (match) {
      version = match[1];
    } else {
      version = '0.0';
    }
  } else if (goog.labs.userAgent.platform.isIos()) {
    re = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/;
    var match = re.exec(userAgentString);
    // Report the version as x.y.z and not x_y_z
    version = match && match[1].replace(/_/g, '.');
  } else if (goog.labs.userAgent.platform.isMacintosh()) {
    re = /Mac OS X ([0-9_.]+)/;
    var match = re.exec(userAgentString);
    // Note: some old versions of Camino do not report an OSX version.
    // Default to 10.
    version = match ? match[1].replace(/_/g, '.') : '10';
  } else if (goog.labs.userAgent.platform.isAndroid()) {
    re = /Android\s+([^\);]+)(\)|;)/;
    var match = re.exec(userAgentString);
    version = match && match[1];
  } else if (goog.labs.userAgent.platform.isChromeOS()) {
    re = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/;
    var match = re.exec(userAgentString);
    version = match && match[1];
  }
  return version || '';
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 */
goog.labs.userAgent.platform.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.platform.getVersion(),
                                     version) >= 0;
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Closure user agent detection.
 * @see http://en.wikipedia.org/wiki/User_agent
 * For more information on browser brand, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent (browser, platform, and device).
 *
 */

goog.provide('goog.labs.userAgent.engine');

goog.require('goog.array');
goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @return {boolean} Whether the rendering engine is Presto.
 */
goog.labs.userAgent.engine.isPresto = function() {
  return goog.labs.userAgent.util.matchUserAgent('Presto');
};


/**
 * @return {boolean} Whether the rendering engine is Trident.
 */
goog.labs.userAgent.engine.isTrident = function() {
  // IE only started including the Trident token in IE8.
  return goog.labs.userAgent.util.matchUserAgent('Trident') ||
      goog.labs.userAgent.util.matchUserAgent('MSIE');
};


/**
 * @return {boolean} Whether the rendering engine is Edge.
 */
goog.labs.userAgent.engine.isEdge = function() {
  return goog.labs.userAgent.util.matchUserAgent('Edge');
};


/**
 * @return {boolean} Whether the rendering engine is WebKit.
 */
goog.labs.userAgent.engine.isWebKit = function() {
  return goog.labs.userAgent.util.matchUserAgentIgnoreCase('WebKit') &&
      !goog.labs.userAgent.engine.isEdge();
};


/**
 * @return {boolean} Whether the rendering engine is Gecko.
 */
goog.labs.userAgent.engine.isGecko = function() {
  return goog.labs.userAgent.util.matchUserAgent('Gecko') &&
      !goog.labs.userAgent.engine.isWebKit() &&
      !goog.labs.userAgent.engine.isTrident() &&
      !goog.labs.userAgent.engine.isEdge();
};


/**
 * @return {string} The rendering engine's version or empty string if version
 *     can't be determined.
 */
goog.labs.userAgent.engine.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  if (userAgentString) {
    var tuples = goog.labs.userAgent.util.extractVersionTuples(
        userAgentString);

    var engineTuple = goog.labs.userAgent.engine.getEngineTuple_(tuples);
    if (engineTuple) {
      // In Gecko, the version string is either in the browser info or the
      // Firefox version.  See Gecko user agent string reference:
      // http://goo.gl/mULqa
      if (engineTuple[0] == 'Gecko') {
        return goog.labs.userAgent.engine.getVersionForKey_(
            tuples, 'Firefox');
      }

      return engineTuple[1];
    }

    // MSIE has only one version identifier, and the Trident version is
    // specified in the parenthetical. IE Edge is covered in the engine tuple
    // detection.
    var browserTuple = tuples[0];
    var info;
    if (browserTuple && (info = browserTuple[2])) {
      var match = /Trident\/([^\s;]+)/.exec(info);
      if (match) {
        return match[1];
      }
    }
  }
  return '';
};


/**
 * @param {!Array<!Array<string>>} tuples Extracted version tuples.
 * @return {!Array<string>|undefined} The engine tuple or undefined if not
 *     found.
 * @private
 */
goog.labs.userAgent.engine.getEngineTuple_ = function(tuples) {
  if (!goog.labs.userAgent.engine.isEdge()) {
    return tuples[1];
  }
  for (var i = 0; i < tuples.length; i++) {
    var tuple = tuples[i];
    if (tuple[0] == 'Edge') {
      return tuple;
    }
  }
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the rendering engine version is higher or the same
 *     as the given version.
 */
goog.labs.userAgent.engine.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(),
                                     version) >= 0;
};


/**
 * @param {!Array<!Array<string>>} tuples Version tuples.
 * @param {string} key The key to look for.
 * @return {string} The version string of the given key, if present.
 *     Otherwise, the empty string.
 * @private
 */
goog.labs.userAgent.engine.getVersionForKey_ = function(tuples, key) {
  // TODO(nnaze): Move to util if useful elsewhere.

  var pair = goog.array.find(tuples, function(pair) {
    return key == pair[0];
  });

  return pair && pair[1] || '';
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @author arv@google.com (Erik Arvidsson)
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent');

goog.require('goog.labs.userAgent.browser');
goog.require('goog.labs.userAgent.engine');
goog.require('goog.labs.userAgent.platform');
goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.define('goog.userAgent.ASSUME_IE', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is EDGE.
 */
goog.define('goog.userAgent.ASSUME_EDGE', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.define('goog.userAgent.ASSUME_GECKO', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.define('goog.userAgent.ASSUME_WEBKIT', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.define('goog.userAgent.ASSUME_MOBILE_WEBKIT', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.define('goog.userAgent.ASSUME_OPERA', false);


/**
 * @define {boolean} Whether the
 *     {@code goog.userAgent.isVersionOrHigher}
 *     function will return true for any version.
 */
goog.define('goog.userAgent.ASSUME_ANY_VERSION', false);


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_EDGE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 *
 * @return {string} The userAgent string.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.labs.userAgent.util.getUserAgent();
};


/**
 * TODO(nnaze): Change type to "Navigator" and update compilation targets.
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (in a WorkerPool, for example).
  return goog.global['navigator'] || null;
};


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA :
    goog.labs.userAgent.browser.isOpera();


/**
 * Whether the user agent is Internet Explorer.
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE :
    goog.labs.userAgent.browser.isIE();


/**
 * Whether the user agent is Microsoft Edge.
 * @type {boolean}
 */
goog.userAgent.EDGE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_EDGE :
    goog.labs.userAgent.engine.isEdge();


/**
 * Whether the user agent is MS Internet Explorer or MS Edge.
 * @type {boolean}
 */
goog.userAgent.EDGE_OR_IE = goog.userAgent.EDGE || goog.userAgent.IE;


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Firefox, and others.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.labs.userAgent.engine.isGecko();


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.labs.userAgent.engine.isWebKit();


/**
 * Whether the user agent is running on a mobile device.
 *
 * This is a separate function so that the logic can be tested.
 *
 * TODO(nnaze): Investigate swapping in goog.labs.userAgent.device.isMobile().
 *
 * @return {boolean} Whether the user agent is running on a mobile device.
 * @private
 */
goog.userAgent.isMobile_ = function() {
  return goog.userAgent.WEBKIT &&
         goog.labs.userAgent.util.matchUserAgent('Mobile');
};


/**
 * Whether the user agent is running on a mobile device.
 *
 * TODO(nnaze): Consider deprecating MOBILE when labs.userAgent
 *   is promoted as the gecko/webkit logic is likely inaccurate.
 *
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.isMobile_();


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO(nicksantos): Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_MAC', false);


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_WINDOWS', false);


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_LINUX', false);


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.define('goog.userAgent.ASSUME_X11', false);


/**
 * @define {boolean} Whether the user agent is running on Android.
 */
goog.define('goog.userAgent.ASSUME_ANDROID', false);


/**
 * @define {boolean} Whether the user agent is running on an iPhone.
 */
goog.define('goog.userAgent.ASSUME_IPHONE', false);


/**
 * @define {boolean} Whether the user agent is running on an iPad.
 */
goog.define('goog.userAgent.ASSUME_IPAD', false);


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11 ||
    goog.userAgent.ASSUME_ANDROID ||
    goog.userAgent.ASSUME_IPHONE ||
    goog.userAgent.ASSUME_IPAD;


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.labs.userAgent.platform.isMacintosh();


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS :
    goog.labs.userAgent.platform.isWindows();


/**
 * Whether the user agent is Linux per the legacy behavior of
 * goog.userAgent.LINUX, which considered ChromeOS to also be
 * Linux.
 * @return {boolean}
 * @private
 */
goog.userAgent.isLegacyLinux_ = function() {
  return goog.labs.userAgent.platform.isLinux() ||
      goog.labs.userAgent.platform.isChromeOS();
};


/**
 * Whether the user agent is running on a Linux operating system.
 *
 * Note that goog.userAgent.LINUX considers ChromeOS to be Linux,
 * while goog.labs.userAgent.platform considers ChromeOS and
 * Linux to be different OSes.
 *
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX :
    goog.userAgent.isLegacyLinux_();


/**
 * @return {boolean} Whether the user agent is an X11 windowing system.
 * @private
 */
goog.userAgent.isX11_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return !!navigator &&
      goog.string.contains(navigator['appVersion'] || '', 'X11');
};


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 :
    goog.userAgent.isX11_();


/**
 * Whether the user agent is running on Android.
 * @type {boolean}
 */
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_ANDROID :
    goog.labs.userAgent.platform.isAndroid();


/**
 * Whether the user agent is running on an iPhone.
 * @type {boolean}
 */
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_IPHONE :
    goog.labs.userAgent.platform.isIphone();


/**
 * Whether the user agent is running on an iPad.
 * @type {boolean}
 */
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_IPAD :
    goog.labs.userAgent.platform.isIpad();


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * Assumes user agent is opera.
 * @private
 */
goog.userAgent.operaVersion_ = function() {
  var version = goog.global.opera.version;
  try {
    return version();
  } catch (e) {
    return version;
  }
};


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  if (goog.userAgent.OPERA && goog.global['opera']) {
    return goog.userAgent.operaVersion_();
  }

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '';
  var arr = goog.userAgent.getVersionRegexResult_();
  if (arr) {
    version = arr ? arr[1] : '';
  }

  if (goog.userAgent.IE) {
    // IE9 can be in document mode 9 but be reporting an inconsistent user agent
    // version.  If it is identifying as a version lower than 9 we take the
    // documentMode as the version instead.  IE8 has similar behavior.
    // It is recommended to set the X-UA-Compatible header to ensure that IE9
    // uses documentMode 9.
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }

  return version;
};


/**
 * @return {Array|undefined} The version regex matches from parsing the user
 *     agent string. These regex statements must be executed inline so they can
 *     be compiled out by the closure compiler with the rest of the useragent
 *     detection logic when ASSUME_* is specified.
 * @private
 */
goog.userAgent.getVersionRegexResult_ = function() {
  var userAgent = goog.userAgent.getUserAgentString();
  if (goog.userAgent.GECKO) {
    return /rv\:([^\);]+)(\)|;)/.exec(userAgent);
  }
  if (goog.userAgent.EDGE) {
    return /Edge\/([\d\.]+)/.exec(userAgent);
  }
  if (goog.userAgent.IE) {
    return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(userAgent);
  }
  if (goog.userAgent.WEBKIT) {
    // WebKit/125.4
    return /WebKit\/(\S+)/.exec(userAgent);
  }
};


/**
 * @return {number|undefined} Returns the document mode (for testing).
 * @private
 */
goog.userAgent.getDocumentMode_ = function() {
  // NOTE(user): goog.userAgent may be used in context where there is no DOM.
  var doc = goog.global['document'];
  return doc ? doc['documentMode'] : undefined;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersionOrHigher}.
 * Calls to compareVersions are surprisingly expensive and, as a browser's
 * version number is unlikely to change during a session, we cache the results.
 * @const
 * @private
 */
goog.userAgent.isVersionOrHigherCache_ = {};


/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
 *     Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION ||
      goog.userAgent.isVersionOrHigherCache_[version] ||
      (goog.userAgent.isVersionOrHigherCache_[version] =
          goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};


/**
 * Deprecated alias to {@code goog.userAgent.isVersionOrHigher}.
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 * @deprecated Use goog.userAgent.isVersionOrHigher().
 */
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;


/**
 * Whether the IE effective document mode is higher or the same as the given
 * document mode version.
 * NOTE: Only for IE, return false for another browser.
 *
 * @param {number} documentMode The document mode version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *     same as the given version.
 */
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return goog.userAgent.DOCUMENT_MODE >= documentMode;
};


/**
 * Deprecated alias to {@code goog.userAgent.isDocumentModeOrHigher}.
 * @param {number} version The version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *      same as the given version.
 * @deprecated Use goog.userAgent.isDocumentModeOrHigher().
 */
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;


/**
 * For IE version < 7, documentMode is undefined, so attempt to use the
 * CSS1Compat property to see if we are in standards mode. If we are in
 * standards mode, treat the browser version as the document mode. Otherwise,
 * IE is emulating version 5.
 * @type {number|undefined}
 * @const
 */
goog.userAgent.DOCUMENT_MODE = (function() {
  var doc = goog.global['document'];
  var mode = goog.userAgent.getDocumentMode_();
  if (!doc || !goog.userAgent.IE) {
    return undefined;
  }
  return mode || (doc['compatMode'] == 'CSS1Compat' ?
      parseInt(goog.userAgent.VERSION, 10) : 5);
})();

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Detects the specific browser and not just the rendering engine.
 *
 */

goog.provide('goog.userAgent.product');

goog.require('goog.labs.userAgent.browser');
goog.require('goog.labs.userAgent.platform');
goog.require('goog.userAgent');


/**
 * @define {boolean} Whether the code is running on the Firefox web browser.
 */
goog.define('goog.userAgent.product.ASSUME_FIREFOX', false);


/**
 * @define {boolean} Whether we know at compile-time that the product is an
 *     iPhone.
 */
goog.define('goog.userAgent.product.ASSUME_IPHONE', false);


/**
 * @define {boolean} Whether we know at compile-time that the product is an
 *     iPad.
 */
goog.define('goog.userAgent.product.ASSUME_IPAD', false);


/**
 * @define {boolean} Whether we know at compile-time that the product is an
 *     AOSP browser or WebView inside a pre KitKat Android phone or tablet.
 */
goog.define('goog.userAgent.product.ASSUME_ANDROID', false);


/**
 * @define {boolean} Whether the code is running on the Chrome web browser on
 * any platform or AOSP browser or WebView in a KitKat+ Android phone or tablet.
 */
goog.define('goog.userAgent.product.ASSUME_CHROME', false);


/**
 * @define {boolean} Whether the code is running on the Safari web browser.
 */
goog.define('goog.userAgent.product.ASSUME_SAFARI', false);


/**
 * Whether we know the product type at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.product.PRODUCT_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_OPERA ||
    goog.userAgent.product.ASSUME_FIREFOX ||
    goog.userAgent.product.ASSUME_IPHONE ||
    goog.userAgent.product.ASSUME_IPAD ||
    goog.userAgent.product.ASSUME_ANDROID ||
    goog.userAgent.product.ASSUME_CHROME ||
    goog.userAgent.product.ASSUME_SAFARI;


/**
 * Whether the code is running on the Opera web browser.
 * @type {boolean}
 */
goog.userAgent.product.OPERA = goog.userAgent.OPERA;


/**
 * Whether the code is running on an IE web browser.
 * @type {boolean}
 */
goog.userAgent.product.IE = goog.userAgent.IE;


/**
 * Whether the code is running on the Firefox web browser.
 * @type {boolean}
 */
goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_FIREFOX :
    goog.labs.userAgent.browser.isFirefox();


/**
 * Whether the user agent is an iPhone or iPod (as in iPod touch).
 * @return {boolean}
 * @private
 */
goog.userAgent.product.isIphoneOrIpod_ = function() {
  return goog.labs.userAgent.platform.isIphone() ||
      goog.labs.userAgent.platform.isIpod();
};


/**
 * Whether the code is running on an iPhone or iPod touch.
 *
 * iPod touch is considered an iPhone for legacy reasons.
 * @type {boolean}
 */
goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_IPHONE :
    goog.userAgent.product.isIphoneOrIpod_();


/**
 * Whether the code is running on an iPad.
 * @type {boolean}
 */
goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_IPAD :
    goog.labs.userAgent.platform.isIpad();


/**
 * Whether the code is running on AOSP browser or WebView inside
 * a pre KitKat Android phone or tablet.
 * @type {boolean}
 */
goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_ANDROID :
    goog.labs.userAgent.browser.isAndroidBrowser();


/**
 * Whether the code is running on the Chrome web browser on any platform
 * or AOSP browser or WebView in a KitKat+ Android phone or tablet.
 * @type {boolean}
 */
goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_CHROME :
    goog.labs.userAgent.browser.isChrome();


/**
 * @return {boolean} Whether the browser is Safari on desktop.
 * @private
 */
goog.userAgent.product.isSafariDesktop_ = function() {
  return goog.labs.userAgent.browser.isSafari() &&
      !goog.labs.userAgent.platform.isIos();
};


/**
 * Whether the code is running on the desktop Safari web browser.
 * Note: the legacy behavior here is only true for Safari not running
 * on iOS.
 * @type {boolean}
 */
goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ?
    goog.userAgent.product.ASSUME_SAFARI :
    goog.userAgent.product.isSafariDesktop_();

// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.BitMatrixLike');

goog.scope(function() {
  /**
   * Interface for readable bitmatrix.
   * @interface
   */
  w69b.img.BitMatrixLike = function() {
  };

  /**
   * @return {number} The width of the matrix.
   */
  w69b.img.BitMatrixLike.prototype.getWidth = function() {
  };

  /**
   * @return {number} The height of the matrix.
   */
  w69b.img.BitMatrixLike.prototype.getHeight = function() {
  };

  /**
   * @param {number} x x pos.
   * @param {number} y y pos.
   * @return {boolean} bit at given position.
   */
  w69b.img.BitMatrixLike.prototype.get = function(x, y) {
  };
});

// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.RGBABitMatrix');
goog.require('w69b.img.BitMatrixLike');

goog.scope(function() {
  /**
   * Wraps rgba image data in an read-only BitMatix-like interface.
   * @param {number} width in pixels.
   * @param {number} height in pixels.
   * @param {(Uint8Array|Uint8ClampedArray)} data image data with
   * values 255 = white, 0 = black.
   * array.
   * @constructor
   * @implements {w69b.img.BitMatrixLike}
   */
  w69b.img.RGBABitMatrix = function(width, height, data) {
    this.data = data;
    this.width = width;
    this.height = height;
  };
  var pro = w69b.img.RGBABitMatrix.prototype;

  /**
   * @return {number} The width of the matrix.
   */
  pro.getWidth = function() {
    return this.width;
  };

  /**
   * @return {number} The height of the matrix.
   */
  pro.getHeight = function() {
    return this.height;
  };


  /**
   * @param {number} x x pos.
   * @param {number} y y pos.
   * @return {boolean} bit at given position.
   */
  pro.get = function(x, y) {
    var pos = 4 * (y * this.width + x);
    if (this.data[pos] > 0)
      return false;
    else
      return true;
  };


});

// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.FormatError');
goog.provide('w69b.qr.InvalidCharsetError');
goog.provide('w69b.qr.NotFoundError');
goog.provide('w69b.qr.ReaderError');
goog.require('goog.debug.Error');

goog.scope(function() {
  /**
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {goog.debug.Error}
   */
  w69b.qr.ReaderError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.ReaderError, goog.debug.Error);

  /**
   * Thrown if decoding fails.
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {w69b.qr.ReaderError}
   */
  w69b.qr.FormatError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.FormatError, w69b.qr.ReaderError);

  /**
   * Thrown if detection fails.
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {w69b.qr.ReaderError}
   */
  w69b.qr.NotFoundError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.NotFoundError, w69b.qr.ReaderError);


  /**
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {goog.debug.Error}
   */
  w69b.qr.InvalidCharsetError = function(opt_msg) {
    goog.base(this, opt_msg || 'InvalidCharset');
  };
  goog.inherits(w69b.qr.InvalidCharsetError, goog.debug.Error);
});

// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.QRImage');

goog.scope(function() {

  /** @typedef {(Uint8ClampedArray|Uint8Array)} */
  w69b.qr.ImageData;
  /**
   * Image data container with width/height.
   * @param {number} width image width in pixels.
   * @param {number} height image height in pixels.
   * @param {w69b.qr.ImageData} data data array.
   * @constructor
   */
  w69b.qr.QRImage = function(width, height, data) {
    this.width = width;
    this.height = height;
    this.data = data;
  };
  var QRImage = w69b.qr.QRImage;
  var pro = QRImage.prototype;

  /**
   * Get value at given position.
   * @param {number} x x pos (col).
   * @param {number} y y pos (row).
   * @return {number} value.
   */
  pro.get = function(x, y) {
    return this.data[y * this.width + x];
  };

  /**
   * @return {number} width.
   */
  pro.getWidth = function() {
    return this.width;
  };

  /**
   * @return {number} height.
   */
  pro.getHeight = function() {
    return this.height;
  };

  /**
   * @return {w69b.qr.ImageData} raw data.
   */
  pro.getMatrix = function() {
    return this.data;
  };

  /**
   * @param {number} y index.
   * @param {Uint8Array} opt_row pre-allocated.
   * @return {Uint8Array} row.
   */
  pro.getRow = function(y, opt_row) {
    var row;
    if (opt_row == null || opt_row.length < this.width)
      row = new Uint8Array(this.width);
    else
      row = opt_row;
    var offset = y * this.width;
    for (var x = 0; x < this.width; ++x)
      row[x] = this.data[offset + x];
    return row;
  };


  /**
   * Get index in data for given position.
   * @param {number} x x pos (col).
   * @param {number} y y pos (row).
   * @return {number} index in data.
   */
  pro.getIndex = function(x, y) {
    return this.width * y + x;
  };

  /**
   * Set value at given position.
   * @param {number} x x pos (col).
   * @param {number} y y pos (row).
   * @param {number} value value to set.
   */
  pro.setValue = function(x, y, value) {
    this.data[y * this.width + x] = value;
  };

  /**
   * Construct Image with new empty buffer.
   * @param {number} width image width.
   * @param {number} height image height.
   * @return {w69b.qr.QRImage} image with given size and a new, empty buffer.
   */
  QRImage.newEmpty = function(width, height) {
    return new QRImage(width, height,
      new Uint8Array(new ArrayBuffer(width * height)));
  };
});


// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.WorkerMessageType');

/**
 * Constants for worker message types.
 * @enum {string}
 */
w69b.qr.WorkerMessageType = {
  DECODED: 'success',
  NOTFOUND: 'notfound',
  PATTERN: 'pattern'
};

goog.exportSymbol('w69b.qr.WorkerMessageType', w69b.qr.WorkerMessageType);
goog.exportSymbol('w69b.qr.WorkerMessageType.DECODED',
  w69b.qr.WorkerMessageType.DECODED);
goog.exportSymbol('w69b.qr.WorkerMessageType.NOTFOUND',
  w69b.qr.WorkerMessageType.NOTFOUND);

// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional sizes.
 * @author brenneman@google.com (Shawn Brenneman)
 */


goog.provide('goog.math.Size');



/**
 * Class for representing sizes consisting of a width and height. Undefined
 * width and height support is deprecated and results in compiler warning.
 * @param {number} width Width.
 * @param {number} height Height.
 * @struct
 * @constructor
 */
goog.math.Size = function(width, height) {
  /**
   * Width
   * @type {number}
   */
  this.width = width;

  /**
   * Height
   * @type {number}
   */
  this.height = height;
};


/**
 * Compares sizes for equality.
 * @param {goog.math.Size} a A Size.
 * @param {goog.math.Size} b A Size.
 * @return {boolean} True iff the sizes have equal widths and equal
 *     heights, or if both are null.
 */
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.width == b.width && a.height == b.height;
};


/**
 * @return {!goog.math.Size} A new copy of the Size.
 */
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing size.
   * @return {string} In the form (50 x 73).
   * @override
   */
  goog.math.Size.prototype.toString = function() {
    return '(' + this.width + ' x ' + this.height + ')';
  };
}


/**
 * @return {number} The longer of the two dimensions in the size.
 */
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};


/**
 * @return {number} The shorter of the two dimensions in the size.
 */
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};


/**
 * @return {number} The area of the size (width * height).
 */
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};


/**
 * @return {number} The perimeter of the size (width + height) * 2.
 */
goog.math.Size.prototype.perimeter = function() {
  return (this.width + this.height) * 2;
};


/**
 * @return {number} The ratio of the size's width to its height.
 */
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};


/**
 * @return {boolean} True if the size has zero area, false if both dimensions
 *     are non-zero numbers.
 */
goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};


/**
 * Clamps the width and height parameters upward to integer values.
 * @return {!goog.math.Size} This size with ceil'd components.
 */
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};


/**
 * @param {!goog.math.Size} target The target size.
 * @return {boolean} True if this Size is the same size or smaller than the
 *     target size in both dimensions.
 */
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};


/**
 * Clamps the width and height parameters downward to integer values.
 * @return {!goog.math.Size} This size with floored components.
 */
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};


/**
 * Rounds the width and height parameters to integer values.
 * @return {!goog.math.Size} This size with rounded components.
 */
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};


/**
 * Scales this size by the given scale factors. The width and height are scaled
 * by {@code sx} and {@code opt_sy} respectively.  If {@code opt_sy} is not
 * given, then {@code sx} is used for both the width and height.
 * @param {number} sx The scale factor to use for the width.
 * @param {number=} opt_sy The scale factor to use for the height.
 * @return {!goog.math.Size} This Size object after scaling.
 */
goog.math.Size.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.width *= sx;
  this.height *= sy;
  return this;
};


/**
 * Uniformly scales the size to perfectly cover the dimensions of a given size.
 * If the size is already larger than the target, it will be scaled down to the
 * minimum size at which it still covers the entire target. The original aspect
 * ratio will be preserved.
 *
 * This function assumes that both Sizes contain strictly positive dimensions.
 * @param {!goog.math.Size} target The target size.
 * @return {!goog.math.Size} This Size object, after optional scaling.
 */
goog.math.Size.prototype.scaleToCover = function(target) {
  var s = this.aspectRatio() <= target.aspectRatio() ?
      target.width / this.width :
      target.height / this.height;

  return this.scale(s);
};


/**
 * Uniformly scales the size to fit inside the dimensions of a given size. The
 * original aspect ratio will be preserved.
 *
 * This function assumes that both Sizes contain strictly positive dimensions.
 * @param {!goog.math.Size} target The target size.
 * @return {!goog.math.Size} This Size object, after optional scaling.
 */
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ?
      target.width / this.width :
      target.height / this.height;

  return this.scale(s);
};

// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.RGBAImageData');

goog.scope(function() {
  /**
   * @param {number} width in pixels.
   * @param {number} height in pixels.
   * @param {Uint8Array=} opt_data optional image data. Defaults to empty
   * array.
   * @constructor
   */
  w69b.img.RGBAImageData = function(width, height, opt_data) {
    this.data = opt_data || new Uint8Array(4 * width * height);
    this.width = width;
    this.height = height;
  };
  var pro = w69b.img.RGBAImageData.prototype;

  pro.set = function(x, y, red, green, blue, opt_alpha) {
    var pos = 4 * (y * this.width + x);
    this.data[pos] = red;
    this.data[pos + 1] = green;
    this.data[pos + 2] = blue;
    this.data[pos + 3] = opt_alpha || 255;
  };

  pro.setGray = function(x, y, gray) {
    this.set(x, y, gray, gray, gray, 255);
  };

  /**
   * @param {number} x pos.
   * @param {number} y pos.
   * @return {Array} [red, green, blue, alpha] values.
   */
  pro.get = function(x, y) {
    var pos = 4 * (y * this.width + x);
    return [this.data[pos], this.data[pos + 1],
      this.data[pos + 2], this.data[pos + 3]];
  };
});

// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.img.WebGLParams');
goog.require('goog.object');

goog.scope(function() {
  /**
   * Helps to apply parameters to a webgl programm.
   * @constructor
   * @param {Object=} opt_config initial config, see set().
   */
  w69b.img.WebGLParams = function(opt_config) {
    this.data_ = {};
    if (opt_config)
      this.set(opt_config);
  };
  var pro = w69b.img.WebGLParams.prototype;

  /**
   * @return {w69b.img.WebGLParams} params object.
   */
  pro.clone = function() {
    var params = new w69b.img.WebGLParams();
    params.data_ = goog.object.clone(this.data_);
    return params;
  };

  /**
   * Sets parameters. Example:
   * {'width': 12.4,
   * 'dimensions': [1024.0, 718.0]
   * 'imageId': ['i', 1]
   * }
   *
   * @param {Object} config mapping of names to either:
     *  one or multiple float values,
     * ['i', 21, 45, 6] one or multiple integers with a preceeding 'i'.
   * @return {w69b.img.WebGLParams} this for chaining.
   */
  pro.set = function(config) {
    goog.object.forEach(config, function(value, key) {
      if (value.length > 0 && value[0] == 'i')
        this.setInt(key, value.slice(1));
      else
        this.setFloat(key, value);
    }, this);
    return this;
  };

  /**
   * @param {string} name parameter name.
   * @param {string} type param type.
   * @param {(number|Array.<number>)} value to set.
   * @private
   */
  pro.setInternal_ = function(name, type, value) {
    this.data_[name] = [type, value];
  };

  /**
   * @param {string} name as passed to shader.
   * @param {(number|Array.<number>)} value integer.
   * @return {w69b.img.WebGLParams} this for chaining.
   */
  pro.setInt = function(name, value) {
    var len = value.length || 1;
    this.setInternal_(name, len + 'i', value);
    return this;
  };

  /**
   * @param {string} name as passed to shader.
   * @param {(number|Array.<number>)} value float.
   * @return {w69b.img.WebGLParams} this for chaining.
   */
  pro.setFloat = function(name, value) {
    var len = value.length || 1;
    this.setInternal_(name, len + 'f', value);
    return this;
  };


  /**
   * @param {string} name parameter name.
   * @return {?number} value or null.
   */
  pro.getValue = function(name) {
    var tuple = this.data_[name];
    if (tuple)
      return tuple[1];
    else
      return null;
  };

  /**
   * Apply parameters to program. You need to call program.use() and
   * program.initCommonAttributes() yourself.
   * @param {w69b.img.WebGLProgram} program webgl program.
   */
  pro.apply = function(program) {
    var setters = program.getNamedSetterFunctions();
    goog.object.forEach(this.data_, function(value, name) {
      var type = value[0];
      var valueArgs = value[1];
      setters[type].apply(program, [name].concat(valueArgs));
    }, this);
  };

  /**
   * Same as apply() but takes care of calling program.use() and
   * initCommonAttribtues()
   * @param {w69b.img.WebGLProgram} program webgl program.
   */
  pro.useAndApply = function(program) {
    program.use();
    program.initCommonAttributes();
    this.apply(program);
  };
});

// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.WebGLPipeline');

goog.scope(function() {
  /**
   * Helps to execute multipass webgl programms by applying multiple programs
   * and parameter successively.
   * @param {w69b.img.WebGLFilter} filter webgl filter.
   * @constructor
   */
  w69b.img.WebGLPipeline = function(filter) {
    this.passes_ = [];
    this.filter_ = filter;
  };
  var pro = w69b.img.WebGLPipeline.prototype;

  /**
   *
   * @param {w69b.img.WebGLProgram} program to run.
   * @param {w69b.img.WebGLParams} parameters to apply.
   */
  pro.addPass = function(program, parameters) {
    this.passes_.push([program, parameters]);
  };

  /**
   * Add custom pass.
   * @param {function(number, number, number)} callback that takes three
   * paramters:
   * - input texture id.
   * - out texture id
   * - working texture id (for intermediate results).
   */
  pro.addCustomPass = function(callback) {
    this.passes_.push(callback);
  };


  pro.render = function(inTextureId, outTextureId, workTextureId,
                        opt_resultOnScreen) {
    var prevProgarm = null;
    var filter = this.filter_;
    var numPasses = this.passes_.length;
    var pingPongTextureIds;
    // Ensures last pass goes on outTextureId.
    if (numPasses % 2 == 0)
      pingPongTextureIds = [workTextureId, outTextureId];
    else
      pingPongTextureIds = [outTextureId, workTextureId];

    var prevTextureId = inTextureId;
    for (var i = 0; i < numPasses; ++i) {
      var pass = this.passes_[i];
      if (pass.length) {
        var program = pass[0];
        var params = pass[1];
        if (program != prevProgarm) {
          program.use();
          program.initCommonAttributes();
          prevProgarm = program;
        }
        program.setUniform1i('imageIn', prevTextureId);
        params.apply(program);
        if (i == numPasses - 1 && opt_resultOnScreen) {
          filter.unbindFramebuffer();
        } else {
          var texId = pingPongTextureIds[i % 2];
          filter.attachTextureToFB(texId);
          prevTextureId = texId;
        }
        var offset = params.getValue('outOffset');
        filter.setViewport(
          offset ? offset[0] : 0,
          offset ? offset[1] : 0,
          params.getValue('width'),
          params.getValue('height'));
        program.drawRect();

      } else {
        // custom pass
        var outTex = pingPongTextureIds[i % 2];
        var workTex = pingPongTextureIds[(i + 1) % 2];
        pass(prevTextureId, outTex, workTex);
        prevTextureId = outTex;
      }

    }
  };


});

goog.provide('w69b.shaders.rectVertex');
w69b.shaders.rectVertex = 'attribute vec2 position;\n' +
  'void main(void) {\n' +
  'gl_Position = vec4(position, 0, 1);\n' +
  '}';
goog.provide('w69b.shaders.scale');
w69b.shaders.scale = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'uniform float outOffsetX;\n' +
  'uniform float inOffsetX;\n' +
  'vec2 outOffset = vec2(outOffsetX, 0);\n' +
  'vec2 inOffset = vec2(inOffsetX, 0) / texdim;\n' +
  'vec2 stepX = vec2(0.7, 0) / indim;\n' +
  'vec2 stepY = vec2(0, 0.7) / indim;\n' +
  'vec2 scale = indim / dim;\n' +
  'vec3 combine(vec3 color1, vec3 color2) {\n' +
  'return vec3(\n' +
  'min(color1.x, color2.x),\n' +
  'max(color1.y, color2.y),\n' +
  'color1.z + color2.z);\n' +
  '}\n' +
  'vec3 sample(vec2 p, vec2 offset) {\n' +
  'vec2 pos = (p + offset);\n' +
  'pos = min(vec2(1.0, 1.0), pos);\n' +
  'pos = max(vec2(0.0, 0.0), pos);\n' +
  'pos = inOffset + texscale * pos;\n' +
  'return texture2D(imageIn, pos).xyz;\n' +
  '}\n' +
  'void main() {\n' +
  'vec2 p = (getNormalizedFragCoord() - outOffset) / dim;\n' +
  'vec3 result = sample(p, - stepX - stepY);\n' +
  'result = combine(result, sample(p, stepX + stepY));\n' +
  'result = combine(result, sample(p, stepX - stepY));\n' +
  'result = combine(result, sample(p, -stepX + stepY));\n' +
  'result.z /= 4.0;\n' +
  'gl_FragColor = vec4(result, 1.0);\n' +
  '}';
goog.provide('w69b.shaders.threshold');
w69b.shaders.threshold = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'uniform sampler2D origImage;\n' +
  'vec2 texscaleBlackLevels = indim / texdim;\n' +
  'void main() {\n' +
  'vec2 p = getNormalizedFragCoord() / dim;\n' +
  'vec4 color = texture2D(origImage, p);\n' +
  'float gray = (color.r + color.g + color.b) / 3.0;\n' +
  'float black = texture2D(imageIn, p * texscaleBlackLevels).z;\n' +
  'float binary = gray > black ? 1.0 : 0.0;\n' +
  'gl_FragColor = vec4(binary, binary, binary, 1.0);\n' +
  '}';
goog.provide('w69b.shaders.binarizeAvg1');
w69b.shaders.binarizeAvg1 = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'vec2 mirrorMargin = 1.0 / indim;\n' +
  'vec2 mirrorBorder = 1.0 - mirrorMargin;\n' +
  'void mirror(inout vec2 pos) {\n' +
  'pos = pos - step(mirrorBorder, pos) * (pos - mirrorBorder);\n' +
  'pos *= 2.0 * (0.5 - step(0.0, -pos));\n' +
  '}\n' +
  'uniform vec2 sampleDirection;\n' +
  'vec2 sampleStep = sampleDirection / indim;\n' +
  'void addSample(inout vec4 result, vec2 p, float offset, float weight) {\n' +
  'vec2 pos = (p + offset * sampleStep);\n' +
  'mirror(pos);\n' +
  'pos *= texscale;\n' +
  'vec4 color = texture2D(imageIn, pos);\n' +
  'float gray = (color.r + color.g + color.b) / 3.0;\n' +
  'result.r = min(result.r, gray);\n' +
  'result.g = max(result.g, gray);\n' +
  'result.b += gray * weight;\n' +
  '}\n' +
  'void gauss9(inout vec4 result, vec2 p) {\n' +
  'addSample(result, p, -4.0, 0.0459);\n' +
  'addSample(result, p, -3.0, 0.0822);\n' +
  'addSample(result, p, -2.0, 0.1247);\n' +
  'addSample(result, p, -1.0, 0.1601);\n' +
  'addSample(result, p, 0.0, 0.1741);\n' +
  'addSample(result, p, 1.0, 0.1601);\n' +
  'addSample(result, p, 2.0, 0.1247);\n' +
  'addSample(result, p, 3.0, 0.0822);\n' +
  'addSample(result, p, 4.0, 0.0459);\n' +
  '}\n' +
  'void main() {\n' +
  'vec2 p = getNormalizedFragCoord() / dim;\n' +
  'vec4 result  = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  'gauss9(result, p);\n' +
  'gl_FragColor = result;\n' +
  '}';
goog.provide('w69b.shaders.binarizeGroup');
w69b.shaders.binarizeGroup = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'vec2 mirrorMargin = 1.0 / indim;\n' +
  'vec2 mirrorBorder = 1.0 - mirrorMargin;\n' +
  'void mirror(inout vec2 pos) {\n' +
  'pos = pos - step(mirrorBorder, pos) * (pos - mirrorBorder);\n' +
  'pos *= 2.0 * (0.5 - step(0.0, -pos));\n' +
  '}\n' +
  'uniform vec2 sampleDirection;\n' +
  'uniform vec2 outOffset;\n' +
  'uniform vec2 inOffset;\n' +
  'vec2 inOffsetNormalized = inOffset / texdim;\n' +
  'vec2 sampleStep = sampleDirection / indim;\n' +
  'void addSample(inout vec4 result, vec2 p, float offset, float weight) {\n' +
  'vec2 pos = (p + offset * sampleStep);\n' +
  'mirror(pos);\n' +
  'pos *= texscale;\n' +
  'pos += inOffsetNormalized;\n' +
  'vec4 color = texture2D(imageIn, pos);\n' +
  'result.r = min(result.r, color.r);\n' +
  'result.g = max(result.g, color.g);\n' +
  'result.b += color.b * weight;\n' +
  '}\n' +
  'void gauss9(inout vec4 result, vec2 p) {\n' +
  'addSample(result, p, -4.0, 0.0459);\n' +
  'addSample(result, p, -3.0, 0.0822);\n' +
  'addSample(result, p, -2.0, 0.1247);\n' +
  'addSample(result, p, -1.0, 0.1601);\n' +
  'addSample(result, p, 0.0, 0.1741);\n' +
  'addSample(result, p, 1.0, 0.1601);\n' +
  'addSample(result, p, 2.0, 0.1247);\n' +
  'addSample(result, p, 3.0, 0.0822);\n' +
  'addSample(result, p, 4.0, 0.0459);\n' +
  '}\n' +
  'void main() {\n' +
  'vec2 p = (getNormalizedFragCoord() - outOffset) / dim;\n' +
  'vec4 result  = vec4(0.0, 0.0, 0.0, 1.0);\n' +
  'gauss9(result, p);\n' +
  '// //\n' +
  'gl_FragColor = result;\n' +
  '//\n' +
  '}';
goog.provide('w69b.shaders.debug');
w69b.shaders.debug = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'uniform vec2 outOffset;\n' +
  'void main() {\n' +
  'vec2 p = (getNormalizedFragCoord() - outOffset) / dim;\n' +
  'vec4 color = vec4(1.0);\n' +
  'color.rg = p;\n' +
  'gl_FragColor = color;\n' +
  '}';
goog.provide('w69b.shaders.dummy');
w69b.shaders.dummy = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'vec2 mirrorMargin = 1.0 / indim;\n' +
  'vec2 mirrorBorder = 1.0 - mirrorMargin;\n' +
  'void mirror(inout vec2 pos) {\n' +
  'pos = pos - step(mirrorBorder, pos) * (pos - mirrorBorder);\n' +
  'pos *= 2.0 * (0.5 - step(0.0, -pos));\n' +
  '}\n' +
  'void main() {\n' +
  'vec2 p = (getNormalizedFragCoord() / dim);\n' +
  'mirror(p);\n' +
  'p *= texscale;\n' +
  'gl_FragColor = texture2D(imageIn, p);\n' +
  '}';
goog.provide('w69b.shaders.estimateBlack');
w69b.shaders.estimateBlack = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'vec2 mirrorMargin = 1.0 / indim;\n' +
  'vec2 mirrorBorder = 1.0 - mirrorMargin;\n' +
  'void mirror(inout vec2 pos) {\n' +
  'pos = pos - step(mirrorBorder, pos) * (pos - mirrorBorder);\n' +
  'pos *= 2.0 * (0.5 - step(0.0, -pos));\n' +
  '}\n' +
  'vec4 sampleAt(vec2 pos, float scale) {\n' +
  'mirror(pos);\n' +
  'vec2 offset = scale * vec2(indim.x, 0) / texdim;\n' +
  'pos = pos * texscale + offset;\n' +
  'return texture2D(imageIn, pos);\n' +
  '}\n' +
  'float getDynRange(vec4 color) {\n' +
  'return color.g - color.r;\n' +
  '}\n' +
  'void main() {\n' +
  'vec2 p = getNormalizedFragCoord() / dim;\n' +
  'vec4 color;\n' +
  'float minDynRange = 0.3;\n' +
  'color = sampleAt(p, 0.0);\n' +
  'if (getDynRange(color) < minDynRange) {\n' +
  'color = sampleAt(p, 1.0);\n' +
  'if (getDynRange(color) < minDynRange) {\n' +
  'color = sampleAt(p, 2.0);\n' +
  '}\n' +
  '}\n' +
  'color.z -= 0.02;\n' +
  'gl_FragColor = color;\n' +
  '}';
goog.provide('w69b.shaders.extractChannel');
w69b.shaders.extractChannel = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'uniform int channel;\n' +
  'void main() {\n' +
  'vec2 p = (getNormalizedFragCoord() / dim);\n' +
  'p *= texscale;\n' +
  'vec4 color = texture2D(imageIn, p);\n' +
  'float gray = color.b;\n' +
  'gl_FragColor = vec4(gray, gray, gray, 1.0);\n' +
  '}';
goog.provide('w69b.shaders.fragCoordTest');
w69b.shaders.fragCoordTest = 'precision mediump float;\n' +
  'void main() {\n' +
  'vec4 result = vec4(1.0);\n' +
  'result.rg = gl_FragCoord.xy / 10.0;\n' +
  'gl_FragColor = result;\n' +
  '}';
goog.provide('w69b.shaders.gaussBlur');
w69b.shaders.gaussBlur = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'vec2 mirrorMargin = 1.0 / indim;\n' +
  'vec2 mirrorBorder = 1.0 - mirrorMargin;\n' +
  'void mirror(inout vec2 pos) {\n' +
  'pos = pos - step(mirrorBorder, pos) * (pos - mirrorBorder);\n' +
  'pos *= 2.0 * (0.5 - step(0.0, -pos));\n' +
  '}\n' +
  'uniform vec2 sampleDirection;\n' +
  'uniform vec2 outOffset;\n' +
  'uniform vec2 inOffset;\n' +
  'vec2 sampleStep = sampleDirection / texdim;\n' +
  'vec2 inOffsetNormalized = inOffset / texdim;\n' +
  'void addSample(inout vec4 result, vec2 p, float offset, float weight) {\n' +
  'vec2 pos = (p + (offset * sampleStep));\n' +
  'mirror(pos);\n' +
  'pos *= texscale;\n' +
  'pos += inOffsetNormalized;\n' +
  'vec4 color = texture2D(imageIn, pos);\n' +
  'result.rgb += color.rgb * weight;\n' +
  '}\n' +
  'void gauss9(inout vec4 result, vec2 p) {\n' +
  'addSample(result, p, -4.0, 0.0459);\n' +
  'addSample(result, p, -3.0, 0.0822);\n' +
  'addSample(result, p, -2.0, 0.1247);\n' +
  'addSample(result, p, -1.0, 0.1601);\n' +
  'addSample(result, p, 0.0, 0.1741);\n' +
  'addSample(result, p, 1.0, 0.1601);\n' +
  'addSample(result, p, 2.0, 0.1247);\n' +
  'addSample(result, p, 3.0, 0.0822);\n' +
  'addSample(result, p, 4.0, 0.0459);\n' +
  '}\n' +
  'void main() {\n' +
  'vec2 p = (getNormalizedFragCoord() - outOffset) / dim;\n' +
  'vec4 result  = vec4(0.0, 0.0, 0.0, 1.0);\n' +
  'gauss9(result, p);\n' +
  'gl_FragColor = result;\n' +
  '}';
goog.provide('w69b.shaders.grayscale');
w69b.shaders.grayscale = 'precision mediump float;\n' +
  'uniform float width;\n' +
  'uniform float height;\n' +
  'uniform float inwidth;\n' +
  'uniform float inheight;\n' +
  'uniform float texwidth;\n' +
  'uniform float texheight;\n' +
  'uniform vec2 fragCoordOffset;\n' +
  'uniform sampler2D imageIn;\n' +
  'vec2 dim = vec2(width, height);\n' +
  'vec2 texdim = vec2(texwidth, texheight);\n' +
  'vec2 indim = vec2(inwidth, inheight);\n' +
  'vec2 texscale = indim / texdim;\n' +
  'vec2 getNormalizedFragCoord() {\n' +
  'return (gl_FragCoord.xy - fragCoordOffset) + 0.5;\n' +
  '}\n' +
  'void main() {\n' +
  'vec2 p = (getNormalizedFragCoord() / dim);\n' +
  'p *= texscale;\n' +
  'vec4 color = texture2D(imageIn, p);\n' +
  'float gray = (color.r + color.g + color.b) / 3.0;\n' +
  'gl_FragColor = vec4(gray, gray, gray, 1.0);\n' +
  '}';
// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.WebGLProgram');
goog.require('w69b.shaders.rectVertex');

goog.scope(function() {
  /**
   * Filters images using webgl shaders.
   * @param {WebGLRenderingContext} gl rendering context.
   * @param {string} fragmentSource fragmentSource.
   * @param {string=} opt_vertexSource vertex shader.
   * @constructor
   */
  w69b.img.WebGLProgram = function(gl, fragmentSource, opt_vertexSource) {
    this.context_ = gl;
    var vertexShader = this.buildShader_(
      opt_vertexSource || w69b.shaders.rectVertex, true);
    var fragmentShader = this.buildShader_(fragmentSource, false);
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw Error('Could not link shader program: ' +
        gl.getProgramInfoLog(shaderProgram));
    }
    this.glProgram = shaderProgram;
  };
  var pro = w69b.img.WebGLProgram.prototype;

  /**
   * Linked shader program.
   */
  pro.glProgram = null;

  /**
   * @type {WebGLRenderingContext} gl rendering context.
   */
  pro.contex_ = null;



  /**
   * Initialize common shader attributes.
   */
  pro.initCommonAttributes = function() {
    var gl = this.context_;
    var program = this.glProgram;
    var positionLocation = gl.getAttribLocation(program, 'position');
    var buffer = gl.createBuffer();
    var vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

    //set position attribute data
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  };

  /**
   * Activates this program.
   */
  pro.use = function() {
    this.context_.useProgram(this.glProgram);
  };

  /**
   * Draws rectangele. InitCommonAttributes needs to have been called first.
   */
  pro.drawRect = function() {
    var gl = this.context_;
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  /**
   * @param {string} name variable name.
   * @param {number} value float value.
   */
  pro.setUniform1f = function(name, value) {
    var location = this.context_.getUniformLocation(this.glProgram, name);
    this.context_.uniform1f(location, value);
  };

  /**
   * For vec2.
   * @param {string} name variable name.
   * @param {number} x float value.
   * @param {number} y float value.
   */
  pro.setUniform2f = function(name, x, y) {
    var location = this.context_.getUniformLocation(this.glProgram, name);
    this.context_.uniform2f(location, x, y);
  };

  /**
   * @param {string} name variable name.
   * @param {(Array.<number>|Float32Array)} value float value.
   */
  pro.setUniform1fv = function(name, value) {
    var location = this.context_.getUniformLocation(this.glProgram, name);
    this.context_.uniform1fv(location, value);
  };

  /**
   * @param {string} name variable name.
   * @param {number} value int value.
   */
  pro.setUniform1i = function(name, value) {
    var location = this.context_.getUniformLocation(this.glProgram, name);
    this.context_.uniform1i(location, value);
  };


  /**
   * @return {Object} mapping of type names to unbound setter functions.
   */
  pro.getNamedSetterFunctions = function() {
    return this.namedSetterFns_;
  };

  /**
   * @type {Object} mapping type names to setter functions.
   * @private
   */
  pro.namedSetterFns_ = {
    '1i': pro.setUniform1i,
    '1f': pro.setUniform1f,
    '2f': pro.setUniform2f
  };

  /**
   * @param {string} source shader source.
   * @param {boolean} isVertex true for vertex shader, false for fragment
   * shader.
   * @return {WebGLShader} shader.
   */
  pro.buildShader_ = function(source, isVertex) {
    var gl = this.context_;
    var shader = gl.createShader(
      isVertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw Error('Could not compile shader: ' +
        gl.getShaderInfoLog(shader));
    }
    return shader;
  };

});


// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.img.NotSupportedError');
goog.provide('w69b.img.WebGLFilter');
goog.require('goog.debug.Error');
goog.require('w69b.img.RGBAImageData');
goog.require('w69b.img.WebGLParams');
goog.require('w69b.img.WebGLPipeline');
goog.require('w69b.img.WebGLProgram');
goog.require('w69b.shaders.fragCoordTest');


goog.scope(function() {
  var WebGLProgram = w69b.img.WebGLProgram;
  var RGBAImageData = w69b.img.RGBAImageData;
  /**
   * Thrown when webgl is not supported.
   * @constructor
   * @extends {goog.debug.Error}
   */
  w69b.img.NotSupportedError = function() {
    goog.base(this);
  };
  goog.inherits(w69b.img.NotSupportedError, goog.debug.Error);
  /** @override */
  w69b.img.NotSupportedError.prototype.name = 'NotSupported';

  /**
   * Filters images using webgl shaders.
   * @param {HTMLCanvasElement=} opt_canvas canvas to use.
   * @constructor
   */
  w69b.img.WebGLFilter = function(opt_canvas) {
    this.textures = [];
    /**
     * @private
     * @type {HTMLCanvasElement}
     */
    this.canvas_ = /** @type {HTMLCanvasElement} */ (
      opt_canvas || document.createElement('canvas'));
    try {
      this.context_ = /** @type {WebGLRenderingContext} */ (
        this.canvas_.getContext('webgl') ||
          this.canvas_.getContext('experimental-webgl'));
    } catch (ignored) {
    }
    if (!this.context_)
      throw new w69b.img.NotSupportedError();
    w69b.img.WebGLFilter.testFragCoordOffset();

    this.framebuffer_ = this.context_.createFramebuffer();
  };
  var _ = w69b.img.WebGLFilter;
  /**
   * @type {Array.<number>}
   * @private
   */
  _.fragCoordOffset_ = null;
  // Simple vertex shader.

  var pro = w69b.img.WebGLFilter.prototype;


  /**
   * Rendering context of back canvas.
   * @type {WebGLRenderingContext}
   * @private
   */
  pro.context_ = null;


  /**
   * @param {number} width canvas width.
   * @param {number} height canvas height.
   */
  pro.setSize = function(width, height) {
    this.canvas_.width = width;
    this.canvas_.height = height;
  };

  /**
   * @return {number} width.
   */
  pro.getWidth = function() {
    return this.canvas_.width;
  };

  /**
   * @return {number} height.
   */
  pro.getHeight = function() {
    return this.canvas_.height;
  };

  /**
   * Set viewport for next rendering call.
   * @param {number} x left offset.
   * @param {number} y bottom offset.
   * @param {number} width size.
   * @param {number} height size.
   */
  pro.setViewport = function(x, y, width, height) {
    this.context_.viewport(x, y, width, height);
  };

  /**
   * Unbind framebuffer.
   */
  pro.unbindFramebuffer = function() {
    var gl = this.context_;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  /**
   * @return {WebGLRenderingContext} webgl context.
   */
  pro.getContext = function() {
    return this.context_;
  };

  /**
   * @param {number} id texture id.
   * @return {WebGLTexture} texture.
   */
  pro.getTexture = function(id) {
    return this.textures[id];
  };

  /**
   * Creates num textures. The first texture is
   */
  pro.createTextures = function(num) {
    var width = this.getWidth();
    var height = this.getHeight();
    for (var i = 0; i < num; ++i)
      this.textures[i] = this.createTexture(i, width, height);
  };

  /**
   * Sets UNPACK_FLIP_Y_WEBGL parameter on given texture.
   * @param {number} id texture id.
   */
  pro.setTextureFlipped = function(id) {
    var gl = this.context_;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[id]);
    // flipped coordinates
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };


  /**
   * Create texture with default parameters.
   * @param {number} id texture unit id.
   * @param {number=} opt_width in pixels.
   * @param {number=} opt_height in pixsels.
   * @return {WebGLTexture} texture.
   */
  pro.createTexture = function(id, opt_width, opt_height) {
    var gl = this.context_;
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + id);
    //set properties for the texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    if (opt_width && opt_height)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, opt_width, opt_height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null);

    // gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  };

  /**
   * Attach texture to framebuffer.
   * @param {number} textureId texture id.
   * @param {WebGLFramebuffer=} opt_framebuffer defaults to this.framebuffer.
   */
  pro.attachTextureToFB = function(textureId, opt_framebuffer) {
    var gl = this.context_;
    var texture = this.textures[textureId];
    gl.bindFramebuffer(gl.FRAMEBUFFER, opt_framebuffer || this.framebuffer_);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, texture, 0);
  };

  /**
   * Returns offset for normalizing gl_FragCoord.
   * @return {Array.<number>} offset.
   */
  pro.getFragCoordOffset = function() {
    return _.fragCoordOffset_;
  };

  /**
   * Get image data of canvas.
   * @return {RGBAImageData} image data.
   */
  pro.getImageData = function() {
    var gl = this.context_;
    var width = this.getWidth();
    var height = this.getHeight();
    var imgdata = new Uint8Array(4 * width * height);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, imgdata);
    return new RGBAImageData(width, height, imgdata);
  };


  /**
   * WebGL implementation supply different offsets for gl_FragCoord to
   * fragment shaders. For the first pixel this can be (0,0), (0.5, 0.5)
   * or (1.0, 1.0). We need to take this into account in our shaders.
   */
  _.testFragCoordOffset = function() {
    if (_.fragCoordOffset_)
      return;
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    canvas.width = 20;
    canvas.height = 20;
    canvas.imageSmoothingEnabled = false;
    var program = new WebGLProgram(gl, w69b.shaders.fragCoordTest);

    program.use();
    program.initCommonAttributes();


    program.drawRect();
    var imgdata = new Uint8Array(4 * canvas.width * canvas.height);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA,
      gl.UNSIGNED_BYTE, imgdata);

    function round(val) {
      return Math.round(100 * val / 255) / 10;
    }

    var xOffset = imgdata[0];
    var yOffset = imgdata[1];
    // assume 0.1 steps.
    xOffset = round(xOffset);
    yOffset = round(yOffset);
    _.fragCoordOffset_ = [xOffset, yOffset];
    // window.console.log('detected fragment coord offset: (' +
    //   xOffset + ' ' + yOffset + ')');
  };


});

// (c) 2013 Manuel Braun (mb@w69b.com)

goog.require('goog.math.Size');
goog.provide('w69b.img.WebGLBinarizer');
goog.require('w69b.img.RGBABitMatrix');
goog.require('w69b.img.RGBAImageData');
goog.require('w69b.img.WebGLFilter');
goog.require('w69b.img.WebGLParams');
goog.require('w69b.img.WebGLPipeline');
goog.require('w69b.img.WebGLProgram');
goog.require('w69b.shaders.binarizeAvg1');
goog.require('w69b.shaders.binarizeGroup');
goog.require('w69b.shaders.debug');
goog.require('w69b.shaders.estimateBlack');
goog.require('w69b.shaders.extractChannel');
goog.require('w69b.shaders.fragCoordTest');
goog.require('w69b.shaders.gaussBlur');
goog.require('w69b.shaders.grayscale');
goog.require('w69b.shaders.rectVertex');
goog.require('w69b.shaders.scale');


goog.scope(function() {
  var WebGLFilter = w69b.img.WebGLFilter;
  var WebGLProgram = w69b.img.WebGLProgram;
  var WebGLParams = w69b.img.WebGLParams;
  var WebGLPipeline = w69b.img.WebGLPipeline;
  var RGBAImageData = w69b.img.RGBAImageData;
  var RGBABitMatrix = w69b.img.RGBABitMatrix;
  /**
   * WebGL shader based image binarizer.
   * The basic idea is to estimate an average black level for each pixel by looking at
   * neighbouring pixels, while choosing the neighbourhood large enough to cover a sufficently
   * large dynamic range.
   * Then simply apply thresholding based on that value.
   *
   * In detail:
   * - Successively apply shaders to compute a scale space and the dynamic range
   * (gaussBlur, binarizeAvg1, binarizeGroup).
   * - Run estimateBlack shader to pick a gray level estimation. It just chooses the
   * gray level from the smallest scale that still satisfies a dynamic range constraint.
   * - Run thresholding shader to apply thresholding on input image gray values with
   * black level estimations.
   *
   * @constructor
   * @param {HTMLCanvasElement=} opt_canvas canvas to use.
   */
  w69b.img.WebGLBinarizer = function(opt_canvas) {
    this.filter_ = new WebGLFilter(opt_canvas);
  };
  var pro = w69b.img.WebGLBinarizer.prototype;
  var _ = w69b.img.WebGLBinarizer;
  /**
   * @type {?boolean}
   */
  _.isSupported_ = null;

  pro.pipeline_ = null;
  pro.setupCalled_ = false;
  /**
   * If canvas is displayed directly, input data needs to be flipped around
   * y axis.
   * @type {boolean}
   * @private
   */
  pro.flipInput_ = false;


  /**
   * Size of native input image/video.
   * @type {?goog.math.Size}
   * @private
   */
  pro.inSize_ = null;

  /**
   * @param {string} source fragment source.
   * @return {w69b.img.WebGLProgram} compiled program.
   */
  pro.getProgram = function(source) {
    return new WebGLProgram(this.filter_.getContext(), source);
  };

  /**
   * @param {boolean} flip whether to flip input arround y axis.
   */
  pro.setFlipInput = function(flip) {
    this.flipInput_ = flip;
  };

  /**
   * Setup binarizer for given image dimensions.
   * Only call this once.
   * @param {number} width in pixels.
   * @param {number} height in pixels.
   * @param {number=} opt_inWidth in pixels.
   * @param {number=} opt_inHeight in pixels.
   */
  pro.setup = function(width, height, opt_inWidth, opt_inHeight) {
    if (!opt_inHeight)
      opt_inHeight = height;
    if (!opt_inWidth)
      opt_inWidth = width;
    if (!this.setupCalled_) {
      // compile shaders
      this.programDynRange1 = this.getProgram(w69b.shaders.binarizeAvg1);
      this.programDynRange2 = this.getProgram(w69b.shaders.binarizeGroup);
      this.programEstimateBlack = this.getProgram(w69b.shaders.estimateBlack);
      this.programThreshold = this.getProgram(w69b.shaders.threshold);
      this.programGauss = this.getProgram(w69b.shaders.gaussBlur);
    }

    if (!this.setupCalled_ ||
      this.filter_.getWidth() != width ||
      this.filter_.getHeight() != height ||
      this.inSize_.width != opt_inWidth ||
      this.inSize_.height != opt_inHeight) {
      this.filter_.setSize(width, height);
      this.inSize_ = new goog.math.Size(opt_inWidth, opt_inHeight);
      this.filter_.createTextures(3);
      if (this.flipInput_)
        this.filter_.setTextureFlipped(0);
      this.pipeline_ = this.createPipeline();
    }
    this.setupCalled_ = true;
  };

  pro.createPipeline = function() {
    var width = this.filter_.getWidth();
    var height = this.filter_.getHeight();
    var inSize = this.inSize_;

    var pipeline = new WebGLPipeline(this.filter_);
    // Some shaders that are useful for debugging.
    // var grayscale = new WebGLProgram(gl, w69b.shaders.grayscale);
    // var dummy = this.getProgram(w69b.shaders.dummy);
    // var extractChannel = this.getProgram(w69b.shaders.extractChannel);
    // var debug = new WebGLProgram(gl, w69b.shaders.debug);
    var baseParams = new WebGLParams(
      {
        'width': width,
        'height': height,
        'inwidth': width,
        'inheight': height,
        'texwidth': width,
        'texheight': height,
        'inOffset': [0, 0],
        'outOffset': [0, 0],
        'fragCoordOffset': this.filter_.getFragCoordOffset()
      });
    var downScalePower = 3;
    var scaledWith = Math.max(1, width >> downScalePower);
    var scaledHeight = Math.max(1, height >> downScalePower);
    var smallImgParams = baseParams.clone().set({
      'width': scaledWith,
      'height': scaledHeight,
      'inwidth': scaledWith,
      'inheight': scaledHeight
    });

    // Apply gauss and downsample to scaledWidth/Height
    pipeline.addPass(this.programGauss,
      baseParams.clone().set({
        'width': scaledWith,
        'sampleDirection': [0, 1],
        'texwidth': inSize.width,
        'texheight': inSize.height
      }));

    pipeline.addPass(this.programGauss,
      smallImgParams.clone().set({
        'inheight': height,
        'sampleDirection': [1, 0]
      }));

    // Compute more dynamic ranges and two more scales on gray
    // level image, in a layout next to each other. Kernel size increases
    // from left to right.
    pipeline.addPass(this.programDynRange1, smallImgParams.clone().set({
      'sampleDirection': [0, 1]
    }));
    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [1, 0]
    }));

    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [0, 2]
    }));
    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [2, 0],
      'outOffset': [scaledWith, 0]
    }));

    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [0, 2],
      'inOffset': [scaledWith, 0]
    }));
    pipeline.addPass(this.programDynRange2, smallImgParams.clone().set({
      'sampleDirection': [2, 0],
      'outOffset': [scaledWith * 2, 0]
    }));
    // Use scale space and dynamic range estimations to estimate black level.
    pipeline.addPass(this.programEstimateBlack, smallImgParams);
    // pipeline.addPass(extractChannel,
    //  smallImgParams.clone().setInt('channel', 2));

    pipeline.addPass(this.programThreshold, smallImgParams.clone()
      .setInt('origImage', 0)
      .set({
        'width': inSize.width, 'height': inSize.height,
        'inwidth': scaledWith, 'inheight': scaledHeight
      }));
    return pipeline;
  };


  /**
   * @return {w69b.img.RGBAImageData} image data.
   */
  pro.getImageData = function() {
    return this.filter_.getImageData();
  };

  /**
   * @return {w69b.img.RGBABitMatrix} image data wrapped in RGBABitmatrix.
   */
  pro.getBitMatrix = function() {
    var imgdata = this.filter_.getImageData();
    return new RGBABitMatrix(imgdata.width, imgdata.height, imgdata.data);
  };

  /**
   * @param {(Image|HTMLVideoElement|RGBAImageData|ImageData)} image image
   * to render.
   */
  pro.render = function(image) {
    if (!this.setupCalled_) {
      throw new Error();
    }
    var gl = this.filter_.getContext();
    // bind input image to texture 0.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.filter_.getTexture(0));
    if (image instanceof RGBAImageData) {
      // custom image data
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image.data);

    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
        image);
    }

    this.pipeline_.render(0, 1, 2, true);
  };

  /**
   * @param {number} width in pixels.
   * @param {number} height in pixels.
   * @return {w69b.img.RGBAImageData} test image.
   */
  _.createSupportCheckImage = function(width, height) {
    var imgdata = new Uint8Array(4 * width * height);
    // build gradient
    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        var pos = 4 * (width * y + x);
        var gray = x;
        imgdata[pos] = gray;
        imgdata[pos + 1] = gray;
        imgdata[pos + 2] = gray;
        imgdata[pos + 3] = 255;
      }
    }
    return new RGBAImageData(width, height, imgdata);
  };

  /**
   *
   */
  _.isSupported = function() {
    // create test image
    if (_.isSupported_ === null) {
      var width = 100;
      var height = 20;
      var img = _.createSupportCheckImage(width, height);
      // set contrast on some pixels.
      img.setGray(30, 4, 18);
      img.setGray(90, 4, 50);
      try {
        var binarizer = new w69b.img.WebGLBinarizer();
      } catch (ignored) {
        // No webgl support.
        return false;
      }
      binarizer.setFlipInput(false);
      binarizer.setup(width, height);
      binarizer.render(img);
      var binary = binarizer.getImageData();
      // Check some black and white values.
      _.isSupported_ = (binary.get(30, 4)[0] == 0 &&
      binary.get(90, 4)[0] == 0 &&
      binary.get(31, 4)[0] == 255 &&
      binary.get(29, 4)[0] == 255);
    }
    return _.isSupported_;
  };

});

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Namespace with crypto related helper functions.
 */

goog.provide('goog.crypt');

goog.require('goog.array');
goog.require('goog.asserts');


/**
 * Turns a string into an array of bytes; a "byte" being a JS number in the
 * range 0-255.
 * @param {string} str String value to arrify.
 * @return {!Array<number>} Array of numbers corresponding to the
 *     UCS character codes of each character in str.
 */
goog.crypt.stringToByteArray = function(str) {
  var output = [], p = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    while (c > 0xff) {
      output[p++] = c & 0xff;
      c >>= 8;
    }
    output[p++] = c;
  }
  return output;
};


/**
 * Turns an array of numbers into the string given by the concatenation of the
 * characters to which the numbers correspond.
 * @param {Array<number>} bytes Array of numbers representing characters.
 * @return {string} Stringification of the array.
 */
goog.crypt.byteArrayToString = function(bytes) {
  var CHUNK_SIZE = 8192;

  // Special-case the simple case for speed's sake.
  if (bytes.length <= CHUNK_SIZE) {
    return String.fromCharCode.apply(null, bytes);
  }

  // The remaining logic splits conversion by chunks since
  // Function#apply() has a maximum parameter count.
  // See discussion: http://goo.gl/LrWmZ9

  var str = '';
  for (var i = 0; i < bytes.length; i += CHUNK_SIZE) {
    var chunk = goog.array.slice(bytes, i, i + CHUNK_SIZE);
    str += String.fromCharCode.apply(null, chunk);
  }
  return str;
};


/**
 * Turns an array of numbers into the hex string given by the concatenation of
 * the hex values to which the numbers correspond.
 * @param {Uint8Array|Array<number>} array Array of numbers representing
 *     characters.
 * @return {string} Hex string.
 */
goog.crypt.byteArrayToHex = function(array) {
  return goog.array.map(array, function(numByte) {
    var hexByte = numByte.toString(16);
    return hexByte.length > 1 ? hexByte : '0' + hexByte;
  }).join('');
};


/**
 * Converts a hex string into an integer array.
 * @param {string} hexString Hex string of 16-bit integers (two characters
 *     per integer).
 * @return {!Array<number>} Array of {0,255} integers for the given string.
 */
goog.crypt.hexToByteArray = function(hexString) {
  goog.asserts.assert(hexString.length % 2 == 0,
                      'Key string length must be multiple of 2');
  var arr = [];
  for (var i = 0; i < hexString.length; i += 2) {
    arr.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return arr;
};


/**
 * Converts a JS string to a UTF-8 "byte" array.
 * @param {string} str 16-bit unicode string.
 * @return {!Array<number>} UTF-8 byte array.
 */
goog.crypt.stringToUtf8ByteArray = function(str) {
  // TODO(user): Use native implementations if/when available
  var out = [], p = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 128) {
      out[p++] = c;
    } else if (c < 2048) {
      out[p++] = (c >> 6) | 192;
      out[p++] = (c & 63) | 128;
    } else {
      out[p++] = (c >> 12) | 224;
      out[p++] = ((c >> 6) & 63) | 128;
      out[p++] = (c & 63) | 128;
    }
  }
  return out;
};


/**
 * Converts a UTF-8 byte array to JavaScript's 16-bit Unicode.
 * @param {Uint8Array|Array<number>} bytes UTF-8 byte array.
 * @return {string} 16-bit Unicode string.
 */
goog.crypt.utf8ByteArrayToString = function(bytes) {
  // TODO(user): Use native implementations if/when available
  var out = [], pos = 0, c = 0;
  while (pos < bytes.length) {
    var c1 = bytes[pos++];
    if (c1 < 128) {
      out[c++] = String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      var c2 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
    } else {
      var c2 = bytes[pos++];
      var c3 = bytes[pos++];
      out[c++] = String.fromCharCode(
          (c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
    }
  }
  return out.join('');
};


/**
 * XOR two byte arrays.
 * @param {!ArrayBufferView|!Array<number>} bytes1 Byte array 1.
 * @param {!ArrayBufferView|!Array<number>} bytes2 Byte array 2.
 * @return {!Array<number>} Resulting XOR of the two byte arrays.
 */
goog.crypt.xorByteArray = function(bytes1, bytes2) {
  goog.asserts.assert(
      bytes1.length == bytes2.length,
      'XOR array lengths must match');

  var result = [];
  for (var i = 0; i < bytes1.length; i++) {
    result.push(bytes1[i] ^ bytes2[i]);
  }
  return result;
};

// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Base64 en/decoding. Not much to say here except that we
 * work with decoded values in arrays of bytes. By "byte" I mean a number
 * in [0, 255].
 *
 * @author doughtie@google.com (Gavin Doughtie)
 */

goog.provide('goog.crypt.base64');

goog.require('goog.asserts');
goog.require('goog.crypt');
goog.require('goog.userAgent');

// Static lookup maps, lazily populated by init_()


/**
 * Maps bytes to characters.
 * @type {Object}
 * @private
 */
goog.crypt.base64.byteToCharMap_ = null;


/**
 * Maps characters to bytes.
 * @type {Object}
 * @private
 */
goog.crypt.base64.charToByteMap_ = null;


/**
 * Maps bytes to websafe characters.
 * @type {Object}
 * @private
 */
goog.crypt.base64.byteToCharMapWebSafe_ = null;


/**
 * Maps websafe characters to bytes.
 * @type {Object}
 * @private
 */
goog.crypt.base64.charToByteMapWebSafe_ = null;


/**
 * Our default alphabet, shared between
 * ENCODED_VALS and ENCODED_VALS_WEBSAFE
 * @type {string}
 */
goog.crypt.base64.ENCODED_VALS_BASE =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789';


/**
 * Our default alphabet. Value 64 (=) is special; it means "nothing."
 * @type {string}
 */
goog.crypt.base64.ENCODED_VALS =
    goog.crypt.base64.ENCODED_VALS_BASE + '+/=';


/**
 * Our websafe alphabet.
 * @type {string}
 */
goog.crypt.base64.ENCODED_VALS_WEBSAFE =
    goog.crypt.base64.ENCODED_VALS_BASE + '-_.';


/**
 * Whether this browser supports the atob and btoa functions. This extension
 * started at Mozilla but is now implemented by many browsers. We use the
 * ASSUME_* variables to avoid pulling in the full useragent detection library
 * but still allowing the standard per-browser compilations.
 *
 * @type {boolean}
 */
goog.crypt.base64.HAS_NATIVE_SUPPORT = goog.userAgent.GECKO ||
                                       goog.userAgent.WEBKIT ||
                                       goog.userAgent.OPERA ||
                                       typeof(goog.global.atob) == 'function';


/**
 * Base64-encode an array of bytes.
 *
 * @param {Array<number>|Uint8Array} input An array of bytes (numbers with
 *     value in [0, 255]) to encode.
 * @param {boolean=} opt_webSafe Boolean indicating we should use the
 *     alternative alphabet.
 * @return {string} The base64 encoded string.
 */
goog.crypt.base64.encodeByteArray = function(input, opt_webSafe) {
  // Assert avoids runtime dependency on goog.isArrayLike, which helps reduce
  // size of jscompiler output, and which yields slight performance increase.
  goog.asserts.assert(goog.isArrayLike(input),
                      'encodeByteArray takes an array as a parameter');

  goog.crypt.base64.init_();

  var byteToCharMap = opt_webSafe ?
                      goog.crypt.base64.byteToCharMapWebSafe_ :
                      goog.crypt.base64.byteToCharMap_;

  var output = [];

  for (var i = 0; i < input.length; i += 3) {
    var byte1 = input[i];
    var haveByte2 = i + 1 < input.length;
    var byte2 = haveByte2 ? input[i + 1] : 0;
    var haveByte3 = i + 2 < input.length;
    var byte3 = haveByte3 ? input[i + 2] : 0;

    var outByte1 = byte1 >> 2;
    var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
    var outByte3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6);
    var outByte4 = byte3 & 0x3F;

    if (!haveByte3) {
      outByte4 = 64;

      if (!haveByte2) {
        outByte3 = 64;
      }
    }

    output.push(byteToCharMap[outByte1],
                byteToCharMap[outByte2],
                byteToCharMap[outByte3],
                byteToCharMap[outByte4]);
  }

  return output.join('');
};


/**
 * Base64-encode a string.
 *
 * @param {string} input A string to encode.
 * @param {boolean=} opt_webSafe If true, we should use the
 *     alternative alphabet.
 * @return {string} The base64 encoded string.
 */
goog.crypt.base64.encodeString = function(input, opt_webSafe) {
  // Shortcut for Mozilla browsers that implement
  // a native base64 encoder in the form of "btoa/atob"
  if (goog.crypt.base64.HAS_NATIVE_SUPPORT && !opt_webSafe) {
    return goog.global.btoa(input);
  }
  return goog.crypt.base64.encodeByteArray(
      goog.crypt.stringToByteArray(input), opt_webSafe);
};


/**
 * Base64-decode a string.
 *
 * @param {string} input to decode.
 * @param {boolean=} opt_webSafe True if we should use the
 *     alternative alphabet.
 * @return {string} string representing the decoded value.
 */
goog.crypt.base64.decodeString = function(input, opt_webSafe) {
  // Shortcut for Mozilla browsers that implement
  // a native base64 encoder in the form of "btoa/atob"
  if (goog.crypt.base64.HAS_NATIVE_SUPPORT && !opt_webSafe) {
    return goog.global.atob(input);
  }
  return goog.crypt.byteArrayToString(
      goog.crypt.base64.decodeStringToByteArray(input, opt_webSafe));
};


/**
 * Base64-decode a string.
 *
 * In base-64 decoding, groups of four characters are converted into three
 * bytes.  If the encoder did not apply padding, the input length may not
 * be a multiple of 4.
 *
 * In this case, the last group will have fewer than 4 characters, and
 * padding will be inferred.  If the group has one or two characters, it decodes
 * to one byte.  If the group has three characters, it decodes to two bytes.
 *
 * @param {string} input Input to decode.
 * @param {boolean=} opt_webSafe True if we should use the web-safe alphabet.
 * @return {!Array<number>} bytes representing the decoded value.
 */
goog.crypt.base64.decodeStringToByteArray = function(input, opt_webSafe) {
  goog.crypt.base64.init_();

  var charToByteMap = opt_webSafe ?
                      goog.crypt.base64.charToByteMapWebSafe_ :
                      goog.crypt.base64.charToByteMap_;

  var output = [];

  for (var i = 0; i < input.length; ) {
    var byte1 = charToByteMap[input.charAt(i++)];

    var haveByte2 = i < input.length;
    var byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
    ++i;

    var haveByte3 = i < input.length;
    var byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
    ++i;

    var haveByte4 = i < input.length;
    var byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
    ++i;

    if (byte1 == null || byte2 == null ||
        byte3 == null || byte4 == null) {
      throw Error();
    }

    var outByte1 = (byte1 << 2) | (byte2 >> 4);
    output.push(outByte1);

    if (byte3 != 64) {
      var outByte2 = ((byte2 << 4) & 0xF0) | (byte3 >> 2);
      output.push(outByte2);

      if (byte4 != 64) {
        var outByte3 = ((byte3 << 6) & 0xC0) | byte4;
        output.push(outByte3);
      }
    }
  }

  return output;
};


/**
 * Lazy static initialization function. Called before
 * accessing any of the static map variables.
 * @private
 */
goog.crypt.base64.init_ = function() {
  if (!goog.crypt.base64.byteToCharMap_) {
    goog.crypt.base64.byteToCharMap_ = {};
    goog.crypt.base64.charToByteMap_ = {};
    goog.crypt.base64.byteToCharMapWebSafe_ = {};
    goog.crypt.base64.charToByteMapWebSafe_ = {};

    // We want quick mappings back and forth, so we precompute two maps.
    for (var i = 0; i < goog.crypt.base64.ENCODED_VALS.length; i++) {
      goog.crypt.base64.byteToCharMap_[i] =
          goog.crypt.base64.ENCODED_VALS.charAt(i);
      goog.crypt.base64.charToByteMap_[goog.crypt.base64.byteToCharMap_[i]] = i;
      goog.crypt.base64.byteToCharMapWebSafe_[i] =
          goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(i);
      goog.crypt.base64.charToByteMapWebSafe_[
          goog.crypt.base64.byteToCharMapWebSafe_[i]] = i;

      // Be forgiving when decoding and correctly decode both encodings.
      if (i >= goog.crypt.base64.ENCODED_VALS_BASE.length) {
        goog.crypt.base64.charToByteMap_[
            goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
        goog.crypt.base64.charToByteMapWebSafe_[
            goog.crypt.base64.ENCODED_VALS.charAt(i)] = i;
      }
    }
  }
};

// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.imgtools');
goog.require('goog.asserts');
goog.require('goog.crypt.base64');
goog.require('goog.math.Size');

goog.scope(function() {
  var _ = w69b.imgtools;
  var Size = goog.math.Size;
  var base64 = goog.crypt.base64;

  /**
   * Get content of canvas as png stored in a blob.
   * @param {HTMLCanvasElement} canvas canvas element.
   * @param {function(Blob)} callback called with blob data.
   */
  _.getCanvasAsBlob = function(canvas, callback) {
    if (canvas['toBlob']) {
      // toBlob supported
      canvas['toBlob'](callback);
    } else if (canvas.toDataURL) {
      var url = canvas.toDataURL();
      var prefix = 'data:image/png;base64,';
      if (!goog.string.startsWith(url, prefix))
        throw Error();
      var data = url.substring(prefix.length);
      data = new Uint8Array(base64.decodeStringToByteArray(data));
      var blob = new Blob([data], {'type': 'image/png'});
      callback(blob);
    } else {
      throw Error();
    }
  };

  /**
   * Get Image data of given Image object. Same origin policy applies to
   * image src. Image has to be loaded. Image is scaled down to opt_maxSize
   * if its width or height is larger.
   * @param {Image|HTMLVideoElement} img image.
   * @param {(number|Size)=} opt_maxSize max size of any dimension in pixels or Size object
   * that img data should cover (cropping bottom-right corners).
   * @return {!ImageData} image data.
   */
  _.getImageData = function(img, opt_maxSize) {
    var size = new Size(
      /** @type {number} */ (img.width || img.videoWidth),
      /** @type {number} */ (img.height || img.videoHeight));

    goog.asserts.assert(size.width > 0 && size.height > 0);
    var canvas = document.createElement('canvas');
    if (opt_maxSize) {
      if (goog.isNumber(opt_maxSize)) {
        opt_maxSize = new Size(opt_maxSize, opt_maxSize);
        if (!size.fitsInside(opt_maxSize))
          size = size.scaleToFit(opt_maxSize);
      } else {
        if (!size.fitsInside(opt_maxSize))
          size = size.scaleToCover(opt_maxSize);
      }
      size.floor();
    }
    canvas.width = size.width;
    canvas.height = size.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, size.width, size.height);
    return context.getImageData(0, 0, size.width, size.height);
  };

  /**
   * Scales size in-place to fit max if larger keeping the aspect ratio.
   * @param {Size} size original size.
   * @param {number} max size in pixels.
   */
  _.scaleIfLarger = function(size, max) {
    var s = Math.min(max / size.width, max / size.height);
    if (s <= 1) {
      size.scale(s).round();
    }
  };

  goog.exportSymbol('w69b.imgtools.getImageData', _.getImageData);
  goog.exportSymbol('w69b.imgtools.getCanvasAsBlob', _.getCanvasAsBlob);
});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.DecodeResult');
goog.require('goog.asserts');
goog.require('w69b.qr.ReaderError');

goog.scope(function() {
  /**
   * Encapsulates decoded result reader error.
   * @param {(string|w69b.qr.ReaderError)} text decoded text or error.
   * @param {Array.<w69b.qr.ResultPoint>=} opt_patterns sed for decoding.
   * @constructor
   */
  w69b.qr.DecodeResult = function(text, opt_patterns) {
    /**
     * @type {(string|w69b.qr.ReaderError)}
     * @private
     */
    this.result_ = text;
    this.patterns_ = opt_patterns || [];
  };
  var pro = w69b.qr.DecodeResult.prototype;

  /**
   * Only available if result is not an error.
   * @return {?string} decoded string.
   */
  pro.getText = function() {
    if (this.isError())
      return null;
    else
      return /** @type {string} */ (this.result_);
  };

  /**
   * @return {boolean} if result was an error.
   */
  pro.isError = function() {
    return (this.result_ instanceof w69b.qr.ReaderError);
  };

  /**
   * @return {?w69b.qr.ReaderError} error.
   */
  pro.getError = function() {
    if (this.isError())
      return /** @type {w69b.qr.ReaderError} */ (this.result_);
    else
      return null;
  };

  /**
   * @return {Array.<w69b.qr.ResultPoint>} decoded string.
   */
  pro.getPatterns = function() {
    return this.patterns_;
  };

  /**
   * @return {Object} JSON object.
   */
  pro['toJSON'] = function() {
    return {
      'text': this.getText(),
      'patterns': this.getPatterns()};
  };
});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.ResultPoint');

goog.scope(function() {
  /**
   * @constructor
   * @param {number} posX x pos.
   * @param {number} posY y pos.
   */
  w69b.qr.ResultPoint = function(posX, posY) {
    this.x = posX;
    this.y = posY;
  };
  var ResultPoint = w69b.qr.ResultPoint;
  var pro = ResultPoint.prototype;

  /**
   * @return {number} x pos.
   */
    pro.getX = function() {
    return this.x;
  };

  /**
   * @return {number} y pos.
   */
  pro.getY = function() {
    return this.y;
  };
});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.AlignmentPattern');
goog.require('w69b.qr.ResultPoint');

goog.scope(function() {
  /**
   * Encapsulates an alignment pattern, which are the smaller square
   * patterns found in all but the simplest QR Codes.
   * @author Sean Owen
   * ported to js by Manuel Braun
   *
   * @param {number} posX x pos.
   * @param {number} posY y pos.
   * @param {number} estimatedModuleSize module size.
   * @constructor
   * @extends {w69b.qr.ResultPoint}
   */
  w69b.qr.AlignmentPattern = function(posX, posY, estimatedModuleSize) {
    goog.base(this, posX, posY);
    this.count = 1;
    this.estimatedModuleSize = estimatedModuleSize;
  };
  var AlignmentPattern = w69b.qr.AlignmentPattern;
  goog.inherits(AlignmentPattern, w69b.qr.ResultPoint);
  var pro = AlignmentPattern.prototype;

  pro.incrementCount = function() {
    this.count++;
  };

  /**
   * Determines if this alignment pattern "about equals" an alignment
   * pattern at the stated
   * position and size -- meaning, it is at nearly the same center with nearly
   * the same size.
   */
  pro.aboutEquals = function(moduleSize, i, j) {
    if (Math.abs(i - this.y) <= moduleSize &&
      Math.abs(j - this.x) <= moduleSize) {
      var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
      return moduleSizeDiff <= 1.0 ||
        moduleSizeDiff / this.estimatedModuleSize <= 1.0;
    }
    return false;
  };

  /**
   * @return {number} module size.
   */
  pro.getEstimatedModuleSize = function() {
    return this.estimatedModuleSize;
  };

  /**
   * Combines this object's current estimate of a finder pattern position
   * and module size
   * with a new estimate.
   * @return {AlignmentPattern} a new containing an average of the two.
   */
  pro.combineEstimate = function(i, j, newModuleSize) {
    var combinedX = (this.x + j) / 2.0;
    var combinedY = (this.y + i) / 2.0;
    var combinedModuleSize = (this.estimatedModuleSize + newModuleSize) / 2.0;
    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
  };


  /**
   * @return {Object} JSON object for pattern.
   */
  pro['toJSON'] = function() {
    return {
      'x': this.getX(),
      'y': this.getY(),
      'size': this.getEstimatedModuleSize()};
  };



});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011
 lazarsoft@gmail.com, www.lazarsoft.info
 */
/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


goog.provide('w69b.qr.AlignmentPatternFinder');
goog.require('w69b.img.BitMatrixLike');
goog.require('w69b.qr.AlignmentPattern');
goog.require('w69b.qr.NotFoundError');


goog.scope(function() {
  var AlignmentPattern = w69b.qr.AlignmentPattern;
  var NotFoundError = w69b.qr.NotFoundError;
  /**
   * This class attempts to find alignment patterns in a QR Code.
   * Alignment patterns look like finder
   * patterns but are smaller and appear at regular intervals throughout the
   * image.
   *
   * At the moment this only looks for the bottom-right alignment pattern.
   *
   *
   * This is mostly a simplified copy of {@link FinderPatternFinder}.
   * It is copied,
   * pasted and stripped down here for maximum performance but does
   * unfortunately duplicate
   * some code.
   *
   * This class is thread-safe but not reentrant. Each thread must allocate
   * its own object.
   *
   * @author Sean Owen
   * @author mb@w69b.com (Manuel Braun) - ported to js
   *
   * @constructor
   * @param {!w69b.img.BitMatrixLike} image image to search.
   * @param {number} startX left column from which to start searching.
   * @param {number} startY stat top row from which to start searching.
   * @param {number} width width of region to search.
   * @param {number} height height of region to search.
   * @param {number} moduleSize size module size so far.
   * @param {?w69b.qr.ResultPointCallback} resultPointCallback callback.
   */
  w69b.qr.AlignmentPatternFinder = function(image, startX, startY, width,
                                            height, moduleSize,
                                            resultPointCallback) {
    /**
     * @type {!w69b.img.BitMatrixLike}
     */
    this.image = image;
    this.possibleCenters = [];
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    this.moduleSize = moduleSize;
    this.crossCheckStateCount = new Array(0, 0, 0);
    this.resultPointCallback = resultPointCallback;
  };
  var AlignmentPatternFinder = w69b.qr.AlignmentPatternFinder;
  var pro = AlignmentPatternFinder.prototype;

  pro.centerFromEnd = function(stateCount, end) {
    return (end - stateCount[2]) - stateCount[1] / 2.0;
  };
  pro.foundPatternCross = function(stateCount) {
    var moduleSize = this.moduleSize;
    var maxVariance = moduleSize / 2.0;
    for (var i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }
    return true;
  };

  pro.crossCheckVertical = function(startI, centerJ, maxCount,
                                    originalStateCountTotal) {
    var image = this.image;

    var maxI = image.getHeight();
    var stateCount = this.crossCheckStateCount;
    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;

    // Start counting up from center
    var i = startI;
    while (i >= 0 && image.get(centerJ, i) &&
      stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }
    // If already too many modules in this state or ran off the edge:
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i >= 0 && !image.get(centerJ, + i) &&
      stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    i = startI + 1;
    while (i < maxI && image.get(centerJ, i) &&
      stateCount[1] <= maxCount) {
      stateCount[1]++;
      i++;
    }
    if (i == maxI || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i < maxI && !image.get(centerJ, i) &&
      stateCount[2] <= maxCount) {
      stateCount[2]++;
      i++;
    }
    if (stateCount[2] > maxCount) {
      return NaN;
    }

    var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >=
      2 * originalStateCountTotal) {
      return NaN;
    }

    return this.foundPatternCross(stateCount) ?
      this.centerFromEnd(stateCount,
        i) : NaN;
  };

  /** <p>This method attempts to find the bottom-right alignment pattern in the
   * image. It is a bit messy since it's pretty performance-critical and so is
   * written to be fast foremost.</p>
   *
   * @return {AlignmentPattern} if found throws NotFoundError if not
   * found.
   */
  pro.handlePossibleCenter = function(stateCount, i, j) {
    var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    var centerJ = this.centerFromEnd(stateCount, j);
    var centerI = this.crossCheckVertical(i, Math.floor(centerJ),
      2 * stateCount[1], stateCountTotal);
    if (!isNaN(centerI)) {
      var estimatedModuleSize = (stateCount[0] + stateCount[1] +
        stateCount[2]) / 3.0;
      var max = this.possibleCenters.length;
      for (var index = 0; index < max; index++) {
        var center = this.possibleCenters[index];
        // Look for about the same center and module size:
        if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
          return center.combineEstimate(centerI, centerJ, estimatedModuleSize);
        }
      }
      // Hadn't found this before; save it
      var point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
      this.possibleCenters.push(point);
      if (this.resultPointCallback != null) {
        this.resultPointCallback(point);
      }
    }
    return null;
  };

  /** <p>This method attempts to find the bottom-right alignment pattern in the
   * image. It is a bit messy since it's pretty performance-critical and so is
   * written to be fast foremost.</p>
   *
   * @return {AlignmentPattern} if found NotFoundException if not
   * found.
   */

  pro.find = function() {
    var startX = this.startX;
    var height = this.height;
    var image = this.image;
    var maxJ = startX + this.width;
    var middleI = this.startY + (height >> 1);
    // We are looking for black/white/black modules in 1:1:1 ratio;
    // this tracks the number of black/white/black modules seen so far
    var stateCount = new Array(0, 0, 0);
    for (var iGen = 0; iGen < height; iGen++) {
      // Search from middle outwards
      var i = middleI +
        ((iGen & 0x01) == 0 ? ((iGen + 1) >> 1) : -((iGen + 1) >> 1));
      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;
      var j = startX;
      // Burn off leading white pixels before anything else; if we start in the
      // middle of a white run, it doesn't make sense to count its length,
      // since we don't know if the white run continued to the left of the
      // start point
      while (j < maxJ && image.get(j, i)) {
        j++;
      }
      var currentState = 0;
      while (j < maxJ) {
        if (image.get(j, i)) {
          // Black pixel
          if (currentState == 1) {
            // Counting black pixels
            stateCount[currentState]++;
          } else {
            // Counting white pixels
            if (currentState == 2) {
              // A winner?
              if (this.foundPatternCross(stateCount)) {
                // Yes
                var confirmed = this.handlePossibleCenter(stateCount, i, j);
                if (confirmed != null) {
                  return confirmed;
                }
              }
              stateCount[0] = stateCount[2];
              stateCount[1] = 1;
              stateCount[2] = 0;
              currentState = 1;
            } else {
              stateCount[++currentState]++;
            }
          }
        } else {
          // White pixel
          if (currentState == 1) {
            // Counting black pixels
            currentState++;
          }
          stateCount[currentState]++;
        }
        j++;
      }
      if (this.foundPatternCross(stateCount)) {
        var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
        if (confirmed != null) {
          return confirmed;
        }
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    if (this.possibleCenters.length > 0) {
      return this.possibleCenters[0];
    }

    throw new NotFoundError();
  };
});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.BitMatrix');
goog.require('w69b.img.BitMatrixLike');

goog.scope(function() {

  /**
   * @param {number} width width.
   * @param {number=} opt_height height defaults to width.
   * @constructor
   * @implements {w69b.img.BitMatrixLike}
   */
  w69b.qr.BitMatrix = function(width, opt_height) {
    var height = goog.isDef(opt_height) ? opt_height : width;
    if (width < 1 || height < 1) {
      throw Error();
    }
    this.width = width;
    this.height = height;
    var rowSize = width >> 5;
    if ((width & 0x1f) != 0) {
      rowSize++;
    }
    this.rowSize = rowSize;
    this.bits = new Uint32Array(rowSize * height);
  };

  var BitMatrix = w69b.qr.BitMatrix;
  var pro = BitMatrix.prototype;

  /**
   * @return {number} The width of the matrix.
   */
  pro.getWidth = function() {
    return this.width;
  };

  /**
   * @return {number} The height of the matrix.
   */
  pro.getHeight = function() {
    return this.height;
  };


  /**
   * @param {number} x x pos.
   * @param {number} y y pos.
   * @return {boolean} bit at given position.
   */
  pro.get = function(x, y) {
    var offset = y * this.rowSize + (x >> 5);
    return ((this.bits[offset] >> (x & 0x1f)) & 1) != 0;
  };

  /**
   * Set bit at given position.
   * @param {number} x x pos.
   * @param {number} y y pos.
   */
  pro.set = function(x, y) {
    var offset = y * this.rowSize + (x >> 5);
    this.bits[offset] |= 1 << (x & 0x1f);
  };

  /**
   * Flip bit at given position.
   * @param {number} x x pos.
   * @param {number} y y pos.
   */
  pro.flip = function(x, y) {
    var offset = y * this.rowSize + (x >> 5);
    this.bits[offset] ^= 1 << (x & 0x1f);
  };

  /**
   * Clear matrix.
   */
  pro.clear = function() {
    var max = this.bits.length;
    for (var i = 0; i < max; i++) {
      this.bits[i] = 0;
    }
  };

  /**
   * Set bits in given rectangle.
   * @param {number} left left pos.
   * @param {number} top top pos.
   * @param {number} width width.
   * @param {number} height height.
   */
  pro.setRegion = function(left, top, width, height) {
    if (top < 0 || left < 0) {
      throw Error();
    }
    if (height < 1 || width < 1) {
      throw Error();   // Height and width must be at least 1
    }
    var right = left + width;
    var bottom = top + height;
    if (bottom > this.height || right > this.width) {
      throw Error();  // The region must fit inside the matrix
    }
    for (var y = top; y < bottom; y++) {
      var offset = y * this.rowSize;
      for (var x = left; x < right; x++) {
        this.bits[offset + (x >> 5)] |= 1 << (x & 0x1f);
      }
    }
  };

  /**
   * @return {string} matrix as string.
   */
  pro.toString = function() {
    var result = [];
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        result.push(this.get(x, y) ? 'X ' : '  ');
      }
      result.push('\n');
    }
    return result.join('');
  };

});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.GridSampler');
goog.provide('w69b.qr.GridSamplerInterface');
goog.require('w69b.qr.NotFoundError');

goog.scope(function() {


  /** Implementations of this class can, given locations of finder patterns for
   * a QR code in an image, sample the right points in the image to reconstruct
   * the QR code, accounting for perspective distortion. It is abstracted since
   * it is relatively expensive and should be allowed to take advantage of
   * platform-specific optimized implementations, like Sun's Java Advanced
   * Imaging library, but which may not be available in other environments such
   * as J2ME, and vice versa.
   *
   * The implementation used can be controlled by calling {
   * setGridSampler(GridSampler)} with an instance of a class which implements
   * this interface.
   *
   * @author Sean Owen
   * @author Manuel Braun (mb@w69b.com) - ported to js
   */

  var _ = w69b.qr.GridSampler;

  _.gridSampler = null;

  /**
   * Sets the implementation of GridSampler used by the library. One global
   * instance is stored, which may sound problematic. But, the implementation
   * provided ought to be appropriate for the entire platform, and all uses of
   * this library in the whole lifetime of the JVM. For instance, an Android
   * activity can swap in an implementation that takes advantage of native
   * platform libraries.
   *
   * @param {w69b.qr.GridSamplerInterface} newGridSampler The
   * platform-specific object to install.
   */
  _.setGridSampler = function(newGridSampler) {
    _.gridSampler = newGridSampler;
  };

  /**
   * @return {w69b.qr.GridSamplerInterface} the current implementation of GridSampler.
   */
  _.getInstance = function() {
    return _.gridSampler;
  };

  /**
   * Grid sample interface.
   * @interface
   */
  w69b.qr.GridSamplerInterface = function() {
  };

  /**
   * Samples an image for a rectangular matrix of bits of the given dimension.
   * @param {w69b.qr.BitMatrix} image image to sample.
   * @param {number} dimensionX width of BitMatrix to sample from image.
   * @param {number} dimensionY height of BitMatrix to sample from
   * image.
   * @return {w69b.qr.BitMatrix} representing a grid of points sampled from
   * the image within a region defined by the "from" parameters by the given
   * points is invalid or results in sampling outside the image boundaries.
   */
  w69b.qr.GridSamplerInterface.prototype.sampleGrid = function(image, dimensionX, dimensionY,
                                             p1ToX, p1ToY, p2ToX, p2ToY, p3ToX,
                                             p3ToY, p4ToX, p4ToY, p1FromX,
                                             p1FromY, p2FromX, p2FromY,
                                             p3FromX, p3FromY, p4FromX,
                                             p4FromY) {

  };

  /**
   * Samples an image for a rectangular matrix of bits of the given dimension.
   * @param {w69b.qr.BitMatrix} image image to sample.
   * @param {number} dimensionX width of BitMatrix to sample from image.
   * @param {number} dimensionY height of BitMatrix to sample from
   * image.
   * @param {w69b.qr.PerspectiveTransform} transform transformation matrix.
   * @return {w69b.qr.BitMatrix} representing a grid of points sampled from
   * the image within a region defined by the "from" parameters by the given
   * points is invalid or results in sampling outside the image boundaries.
   */
  w69b.qr.GridSamplerInterface.prototype.sampleGridTransform = function(image, dimensionX,
                                                      dimensionY, transform) {
  };

  /**
   * <p>Checks a set of points that have been transformed to sample points on
   * an image against the image's dimensions to see if the point are even
   * within the image.</p>
   *
   * <p>This method will actually "nudge" the endpoints back onto the image if
   * they are found to be barely (less than 1 pixel) off the image. This
   * accounts for imperfect detection of finder patterns in an image where the
   * QR Code runs all the way to the image border.</p>
   *
   * <p>For efficiency, the method will check points from either end of the
   * line until one is found to be within the image. Because the set of points
   * are assumed to be linear, this is valid.</p>
   *
   * @param {w69b.qr.BitMatrix} image image into which the points should map.
   * @param {Array.<number>} points actual points in x1,y1,...,xn,yn form.
   */
  _.checkAndNudgePoints = function(image, points) {
    var width = image.getWidth();
    var height = image.getHeight();
    // Check and nudge points from start until we see some that are OK:
    var nudged = true;
    var x, y, offset;
    for (offset = 0; offset < points.length && nudged; offset += 2) {
      x = points[offset] >> 0;
      y = points[offset + 1] >> 0;
      if (x < -1 || x > width || y < -1 || y > height) {
        throw new w69b.qr.NotFoundError();
      }
      nudged = false;
      if (x == -1) {
        points[offset] = 0.;
        nudged = true;
      } else if (x == width) {
        points[offset] = width - 1;
        nudged = true;
      }
      if (y == -1) {
        points[offset + 1] = 0.;
        nudged = true;
      } else if (y == height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }
    // Check and nudge points from end:
    nudged = true;
    for (offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
      x = points[offset] >> 0;
      y = points[offset + 1] >> 0;
      if (x < -1 || x > width || y < -1 || y > height) {
        throw new w69b.qr.NotFoundError();
      }
      nudged = false;
      if (x == -1) {
        points[offset] = 0.;
        nudged = true;
      } else if (x == width) {
        points[offset] = width - 1;
        nudged = true;
      }
      if (y == -1) {
        points[offset + 1] = 0.;
        nudged = true;
      } else if (y == height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }
  };


});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.PerspectiveTransform');

goog.scope(function() {
  /**
   * @constructor
   */
  w69b.qr.PerspectiveTransform = function(a11, a21, a31, a12, a22, a32, a13,
                                          a23, a33) {
    this.a11 = a11;
    this.a12 = a12;
    this.a13 = a13;
    this.a21 = a21;
    this.a22 = a22;
    this.a23 = a23;
    this.a31 = a31;
    this.a32 = a32;
    this.a33 = a33;
  };
  var PerspectiveTransform = w69b.qr.PerspectiveTransform;
  var pro = PerspectiveTransform.prototype;
  pro.transformPoints1 = function(points) {
    var max = points.length;
    var a11 = this.a11;
    var a12 = this.a12;
    var a13 = this.a13;
    var a21 = this.a21;
    var a22 = this.a22;
    var a23 = this.a23;
    var a31 = this.a31;
    var a32 = this.a32;
    var a33 = this.a33;
    for (var i = 0; i < max; i += 2) {
      var x = points[i];
      var y = points[i + 1];
      var denominator = a13 * x + a23 * y + a33;
      points[i] = (a11 * x + a21 * y + a31) / denominator;
      points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
  };

  pro.transformPoints2 = function(xValues, yValues) {
    var n = xValues.length;
    for (var i = 0; i < n; i++) {
      var x = xValues[i];
      var y = yValues[i];
      var denominator = this.a13 * x + this.a23 * y + this.a33;
      xValues[i] = (this.a11 * x + this.a21 * y + this.a31) / denominator;
      yValues[i] = (this.a12 * x + this.a22 * y + this.a32) / denominator;
    }
  };

  pro.buildAdjoint = function() {
    // Adjoint is the transpose of the cofactor matrix:
    return new PerspectiveTransform(this.a22 * this.a33 -
      this.a23 * this.a32,
      this.a23 * this.a31 - this.a21 * this.a33,
      this.a21 * this.a32 - this.a22 * this.a31,
      this.a13 * this.a32 - this.a12 * this.a33,
      this.a11 * this.a33 - this.a13 * this.a31,
      this.a12 * this.a31 - this.a11 * this.a32,
      this.a12 * this.a23 - this.a13 * this.a22,
      this.a13 * this.a21 - this.a11 * this.a23,
      this.a11 * this.a22 - this.a12 * this.a21);
  };

  pro.times = function(other) {
    return new PerspectiveTransform(this.a11 * other.a11 +
      this.a21 * other.a12 + this.a31 * other.a13,
      this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23,
      this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33,
      this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13,
      this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23,
      this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33,
      this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13,
      this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23,
      this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33);
  };

  PerspectiveTransform.quadrilateralToQuadrilateral = function(
    x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {

    var qToS = PerspectiveTransform.quadrilateralToSquare(
      x0, y0, x1, y1, x2, y2, x3, y3);
    var sToQ = PerspectiveTransform.squareToQuadrilateral(
      x0p, y0p, x1p, y1p, x2p, y2p, x3p,
      y3p);
    return sToQ.times(qToS);
  };

  PerspectiveTransform.squareToQuadrilateral = function(x0, y0, x1, y1,
                                                        x2, y2, x3, y3) {
    var dy2 = y3 - y2;
    var dy3 = y0 - y1 + y2 - y3;
    if (dy2 == 0.0 && dy3 == 0.0) {
      return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1,
        y0,
        0.0, 0.0, 1.0);
    } else {
      var dx1 = x1 - x2;
      var dx2 = x3 - x2;
      var dx3 = x0 - x1 + x2 - x3;
      var dy1 = y1 - y2;
      var denominator = dx1 * dy2 - dx2 * dy1;
      var a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
      var a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
      return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3,
        x0,
        y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1.0);
    }
  };

  PerspectiveTransform.quadrilateralToSquare = function(x0, y0, x1, y1,
                                                        x2, y2, x3, y3) {
    // Here, the adjoint serves as the inverse:
    return PerspectiveTransform.squareToQuadrilateral(
      x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.DefaultGridSampler');
goog.require('w69b.qr.BitMatrix');
goog.require('w69b.qr.GridSampler');
goog.require('w69b.qr.GridSamplerInterface');
goog.require('w69b.qr.PerspectiveTransform');

goog.scope(function() {

  var PerspectiveTransform = w69b.qr.PerspectiveTransform;
  var GridSampler = w69b.qr.GridSampler;
  var BitMatrix = w69b.qr.BitMatrix;
  /**
   * @author Sean Owen
   * @author Manuel Braun (mb@w69b.com) - ported to js.
   * @constructor
   * @implements {w69b.qr.GridSamplerInterface}
   */
  w69b.qr.DefaultGridSampler = function() {
  };
  var pro = w69b.qr.DefaultGridSampler.prototype;

  pro.sampleGrid = function(image, dimensionX, dimensionY, p1ToX, p1ToY, p2ToX,
                            p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX,
                            p1FromY, p2FromX, p2FromY, p3FromX, p3FromY,
                            p4FromX, p4FromY) {

    var transform = PerspectiveTransform.quadrilateralToQuadrilateral(
      p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY,
      p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY);

    return this.sampleGridTransform(image, dimensionX, dimensionY, transform);
  };

  pro.sampleGridTransform = function(image, dimensionX, dimensionY,
                                     transform) {
    if (dimensionX <= 0 || dimensionY <= 0) {
      throw new w69b.qr.NotFoundError();
    }
    var bits = new BitMatrix(dimensionX, dimensionY);
    var points = new Array(dimensionX << 1);
    var x;
    for (var y = 0; y < dimensionY; y++) {
      var max = points.length;
      var iValue = y + 0.5;
      for (x = 0; x < max; x += 2) {
        points[x] = (x >> 1) + 0.5;
        points[x + 1] = iValue;
      }
      transform.transformPoints1(points);
      // Quick check to see if points transformed to something inside the
      // image; sufficient to check the endpoints
      GridSampler.checkAndNudgePoints(image, points);
      try {
        for (x = 0; x < max; x += 2) {
          if (image.get(points[x] >> 0, points[x + 1] >> 0)) {
            // Black(-ish) pixel
            bits.set(x >> 1, y);
          }
        }
      } catch (aioobe) {
        // This feels wrong, but, sometimes if the finder patterns are
        // misidentified, the resulting transform gets "twisted" such that it
        // maps a straight line of points to a set of points whose endpoints
        // are in bounds, but others are not. There is probably some
        // mathematical way to detect this about the transformation that I
        // don't know yet.  This results in an ugly runtime exception despite
        // our clever checks above -- can't have that. We could check each
        // point's coordinates but that feels duplicative. We settle for
        // catching and wrapping ArrayIndexOutOfBoundsException.
        throw new w69b.qr.NotFoundError();
      }
    }
    return bits;
  };

  // set default grid sampler.
  GridSampler.setGridSampler(new w69b.qr.DefaultGridSampler());

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.DecodeHintType');

/**
 * Decode hint key constants.
 * @enum {number}
 */
w69b.qr.DecodeHintType = {
  TRY_HARDER: 1,
  CHARACTER_SET: 2
};

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.FinderPattern');
goog.provide('w69b.qr.FinderPatternInfo');
goog.require('w69b.qr.ResultPoint');

goog.scope(function() {
  /**
   * @param {number} posX x pos.
   * @param {number} posY y pos.
   * @param {number} estimatedModuleSize estimated size.
   * @param {number=} opt_count count, defaults to 1.
   * @extends {w69b.qr.ResultPoint}
   * @constructor
   */
  w69b.qr.FinderPattern = function(posX, posY, estimatedModuleSize,
                                   opt_count) {
    goog.base(this, posX, posY);
    this.count = goog.isDef(opt_count) ? opt_count : 1;
    this.estimatedModuleSize = estimatedModuleSize;
  };
  var FinderPattern = w69b.qr.FinderPattern;
  goog.inherits(FinderPattern, w69b.qr.ResultPoint);
  var pro = FinderPattern.prototype;

  pro.incrementCount = function() {
    this.count++;
  };

  pro.getCount = function() {
    return this.count;
  };

  pro.aboutEquals = function(moduleSize, i, j) {
    if (Math.abs(i - this.y) <= moduleSize &&
      Math.abs(j - this.x) <= moduleSize) {
      var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
      return moduleSizeDiff <= 1.0 ||
        moduleSizeDiff <= this.estimatedModuleSize;
    }
    return false;
  };

  /**
   * Combines this object's current estimate of a finder pattern position and
   * module size
   * with a new estimate. It returns a new {@code FinderPattern} containing
   * a weighted average based on count.
   * @param {number} i position.
   * @param {number} j position.
   * @param {number} newModuleSize size.
   * @return {FinderPattern} combined pattern.
   */
  pro.combineEstimate = function(i, j, newModuleSize) {
    var count = this.count;
    var combinedCount = count + 1;
    var combinedX = (count * this.x + j) / combinedCount;
    var combinedY = (count * this.y + i) / combinedCount;
    var combinedModuleSize = (count * this.estimatedModuleSize +
      newModuleSize) / combinedCount;
    return new FinderPattern(combinedX, combinedY,
      combinedModuleSize, combinedCount);
  };



  /**
   * @return {number} module size.
   */
  pro.getEstimatedModuleSize = function() {
    return this.estimatedModuleSize;
  };

  /**
   * @return {number} x pos.
   */
  pro.getX = function() {
    return this.x;
  };

  /**
   * @return {number} y pos.
   */
  pro.getY = function() {
    return this.y;
  };

  /**
   * Orders an array of three ResultPoints in an order [A,B,C] such that
   * AB < AC and
   * BC < AC and
   * the angle between BC and BA is less than 180 degrees.

   * @param {Array.<w69b.qr.FinderPattern>} patterns patterns to sort.
   */
  FinderPattern.orderBestPatterns = function(patterns) {
    function distance(pattern1, pattern2) {
      var xDiff = pattern1.x - pattern2.x;
      var yDiff = pattern1.y - pattern2.y;
      return (xDiff * xDiff + yDiff * yDiff);
    }

    // Returns the z component of the cross product between
    // vectors BC and BA.
    function crossProductZ(pointA, pointB, pointC) {
      var bX = pointB.x;
      var bY = pointB.y;
      return ((pointC.x - bX) * (pointA.y - bY)) -
        ((pointC.y - bY) * (pointA.x - bX));
    }


    // Find distances between pattern centers
    var zeroOneDistance = distance(patterns[0], patterns[1]);
    var oneTwoDistance = distance(patterns[1], patterns[2]);
    var zeroTwoDistance = distance(patterns[0], patterns[2]);

    var pointA, pointB, pointC;
    // Assume one closest to other two is B; A and C will just be guesses at
    // first.
    if (oneTwoDistance >= zeroOneDistance &&
      oneTwoDistance >= zeroTwoDistance) {
      pointB = patterns[0];
      pointA = patterns[1];
      pointC = patterns[2];
    } else if (zeroTwoDistance >= oneTwoDistance &&
      zeroTwoDistance >= zeroOneDistance) {
      pointB = patterns[1];
      pointA = patterns[0];
      pointC = patterns[2];
    } else {
      pointB = patterns[2];
      pointA = patterns[0];
      pointC = patterns[1];
    }

    // Use cross product to figure out whether A and C are correct or flipped.
    // This asks whether BC x BA has a positive z component, which is the
    // arrangement we want for A, B, C. If it's negative, then we've got it
    // flipped around and should swap A and C.
    if (crossProductZ(pointA, pointB, pointC) < 0.0) {
      var temp = pointA;
      pointA = pointC;
      pointC = temp;
    }

    patterns[0] = pointA;
    patterns[1] = pointB;
    patterns[2] = pointC;
  };


  /**
   * @return {Object} JSON object for pattern.
   */
  pro['toJSON'] = function() {
    return {
      'x': this.getX(),
      'y': this.getY(),
      'size': this.getEstimatedModuleSize()};
  };


  /**
   * @param {Array.<FinderPattern>} patternCenters size 3 array with
   * bottom left, top left and top right corner.
   * @constructor
   */
  w69b.qr.FinderPatternInfo = function(patternCenters) {
    // Bottom left and top right is flipped. Why?
    this.bottomLeft = patternCenters[0];
    this.topLeft = patternCenters[1];
    this.topRight = patternCenters[2];
  };
});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.FinderPatternFinder');
goog.require('goog.array');
goog.require('w69b.img.BitMatrixLike');
goog.require('w69b.qr.DecodeHintType');
goog.require('w69b.qr.FinderPattern');
goog.require('w69b.qr.FinderPatternInfo');
goog.require('w69b.qr.NotFoundError');
goog.require('w69b.qr.QRImage');


goog.scope(function() {
  var FinderPattern = w69b.qr.FinderPattern;
  var FinderPatternInfo = w69b.qr.FinderPatternInfo;

  /** @typedef {function((w69b.qr.AlignmentPattern|w69b.qr.FinderPattern))} */
  w69b.qr.ResultPointCallback;

  /**
   * <p>This class attempts to find finder patterns in a QR Code. Finder
   * patterns are the square
   * markers at three corners of a QR Code.</p>
   *
   * <p>This class is thread-safe but not reentrant. Each thread must allocate
   * its own object.
   *
   * @author Sean Owen
   * ported to js by Manuel Braun
   */

  /**
   * @param {!w69b.img.BitMatrixLike} image binary image.
   * @param {?w69b.qr.ResultPointCallback=} opt_callback callback.
   * @constructor
   */
  w69b.qr.FinderPatternFinder = function(image, opt_callback) {
    /**
     * @type {!w69b.img.BitMatrixLike}
     * @private
     */
    this.image_ = image;
    /**
     * @type {Array.<FinderPattern>}
     */
    this.possibleCenters_ = [];
    /**
     *
     * @type {Array}
     * @private
     */
    this.crossCheckStateCount_ = new Array(5);
    /**
     * @type {?w69b.qr.ResultPointCallback}
     * @private
     */
    this.resultPointCallback_ = opt_callback || null;
    /**
     * @type {boolean}
     * @private
     */
    this.hasSkipped_ = false;

  };
  var _ = w69b.qr.FinderPatternFinder;
  var pro = w69b.qr.FinderPatternFinder.prototype;

  // manu: changed from 2 to 3 for more robustness.
  _.CENTER_QUORUM = 2;
  _.MIN_SKIP = 3; // 1 pixel/module times 3 modules/center
  _.MAX_MODULES = 57; // support up to version 10 for mobile clients
  _.INTEGER_MATH_SHIFT = 8;

  // Maximum skew error to skip scanning soon.
  _.SKEW_THRESHOLD = 0.05;
  // Precomputed combinations for 3 out of 6.
  _.SKEW_COMBINATIONS = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 1, 4],
    [0, 1, 5],
    [0, 2, 3],
    [0, 2, 4],
    [0, 2, 5],
    [0, 3, 4],
    [0, 3, 5],
    [0, 4, 5],
    [1, 2, 3],
    [1, 2, 4],
    [1, 2, 5],
    [1, 3, 4],
    [1, 3, 5],
    [1, 4, 5],
    [2, 3, 4],
    [2, 3, 5],
    [2, 4, 5],
    [3, 4, 5]
  ];


  /**
   * @param {Object=} opt_hints hints.
   * @return {FinderPatternInfo} info.
   */
  pro.find = function(opt_hints) {
    var tryHarder = opt_hints && !!opt_hints[w69b.qr.DecodeHintType.TRY_HARDER];
    var maxI = this.image_.height;
    var maxJ = this.image_.width;
    // We are looking for black/white/black/white/black modules in
    // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far

    // Let's assume that the maximum version QR Code we support takes up 1/4
    // the height of the
    // this.image_, and then account for the center being 3 modules in size.
    // This gives the smallest
    // number of pixels the center could be, so skip this often. When trying
    // harder, look for all
    // QR versions regardless of how dense they are.
    var iSkip = Math.floor((3 * maxI) / (4 * _.MAX_MODULES));
    if (iSkip < _.MIN_SKIP || tryHarder) {
      iSkip = _.MIN_SKIP;
    }

    var done = false;
    var stateCount = new Array(5);
    var confirmed;
    for (var i = iSkip - 1; i < maxI && !done; i += iSkip) {
      // Get a row of black/white values
      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;
      stateCount[3] = 0;
      stateCount[4] = 0;
      var currentState = 0;
      for (var j = 0; j < maxJ; j++) {
        if (this.image_.get(j, i)) {
          // Black pixel
          if ((currentState & 1) == 1) { // Counting white pixels
            currentState++;
          }
          stateCount[currentState]++;
        } else { // White pixel
          if ((currentState & 1) == 0) { // Counting black pixels
            if (currentState == 4) { // A winner?
              if (_.foundPatternCross(stateCount)) { // Yes
                confirmed = this.handlePossibleCenter(stateCount, i, j);
                if (confirmed) {
                  // Start examining every other line. Checking each line
                  // turned out to be too
                  // expensive and didn't improve performance.
                  iSkip = 2;
                  if (this.hasSkipped_) {
                    done = this.haveMultiplyConfirmedCenters();
                  } else {
                    var rowSkip = this.findRowSkip();
                    if (rowSkip > stateCount[2]) {
                      // Skip rows between row of lower confirmed center
                      // and top of presumed third confirmed center
                      // but back up a bit to get a full chance of detecting
                      // it, entire width of center of finder pattern

                      // Skip by rowSkip, but back off by stateCount[2]
                      // (size of last center
                      // of pattern we saw) to be conservative, and also
                      // back off by iSkip which
                      // is about to be re-added
                      i += rowSkip - stateCount[2] - iSkip;
                      j = maxJ - 1;
                    }
                  }
                } else {
                  stateCount[0] = stateCount[2];
                  stateCount[1] = stateCount[3];
                  stateCount[2] = stateCount[4];
                  stateCount[3] = 1;
                  stateCount[4] = 0;
                  currentState = 3;
                  continue;
                }
                // Clear state to start looking again
                currentState = 0;
                stateCount[0] = 0;
                stateCount[1] = 0;
                stateCount[2] = 0;
                stateCount[3] = 0;
                stateCount[4] = 0;
              } else { // No, shift counts back by two
                stateCount[0] = stateCount[2];
                stateCount[1] = stateCount[3];
                stateCount[2] = stateCount[4];
                stateCount[3] = 1;
                stateCount[4] = 0;
                currentState = 3;
              }
            } else {
              stateCount[++currentState]++;
            }
          } else { // Counting white pixels
            stateCount[currentState]++;
          }
        }
      }
      if (_.foundPatternCross(stateCount)) {
        confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
        if (confirmed) {
          iSkip = stateCount[0];
          if (this.hasSkipped_) {
            // Found a third one
            done = this.haveMultiplyConfirmedCenters();
          }
        }
      }
    }

    var patternInfo = this.selectBestPatterns(true);
    w69b.qr.FinderPattern.orderBestPatterns(patternInfo);

    return new FinderPatternInfo(patternInfo);
  };

  /**
   * Given a count of black/white/black/white/black pixels just seen and an
   * end position,
   * figures the location of the center of this run.
   * @param {Array.<number>} stateCount state count.
   * @param {number} end end position.
   * @return {number} position.
   */
  pro.centerFromEnd = function(stateCount, end) {
    return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.;
  };

  /**
   * @param {Array.<number>} stateCount count of
   * black/white/black/white/black pixels just read.
   * @return {boolean} true iff the proportions of the counts is close enough
   * to the 1/1/3/1/1 ratios used by finder patterns to be considered a match.
   */
  _.foundPatternCross = function(stateCount) {
    var totalModuleSize = 0;
    for (var i = 0; i < 5; i++) {
      var count = stateCount[i];
      if (count == 0) {
        return false;
      }
      totalModuleSize += count;
    }
    if (totalModuleSize < 7) {
      return false;
    }
    var moduleSize = Math.floor((totalModuleSize << _.INTEGER_MATH_SHIFT) / 7);
    var maxVariance = Math.floor(moduleSize / 2);
    // Allow less than 50% variance from 1-1-3-1-1 proportions
    return Math.abs(moduleSize - (stateCount[0] << _.INTEGER_MATH_SHIFT)) <
      maxVariance &&
      Math.abs(moduleSize - (stateCount[1] << _.INTEGER_MATH_SHIFT)) <
        maxVariance &&
      Math.abs(3 * moduleSize - (stateCount[2] << _.INTEGER_MATH_SHIFT)) <
        3 * maxVariance &&
      Math.abs(moduleSize - (stateCount[3] << _.INTEGER_MATH_SHIFT)) <
        maxVariance &&
      Math.abs(moduleSize - (stateCount[4] << _.INTEGER_MATH_SHIFT)) <
        maxVariance;
  };

  /**
   * @return {Array.<number>} count.
   */
  pro.getCrossCheckStateCount = function() {
    this.crossCheckStateCount_[0] = 0;
    this.crossCheckStateCount_[1] = 0;
    this.crossCheckStateCount_[2] = 0;
    this.crossCheckStateCount_[3] = 0;
    this.crossCheckStateCount_[4] = 0;
    return this.crossCheckStateCount_;
  };

  /**
   * <p>After a horizontal scan finds a potential finder pattern, this method
   * "cross-checks" by scanning down vertically through the center of the
   * possible finder pattern to see if the same proportion is detected.</p>
   *
   * @param {number} startI row where a finder pattern was detected.
   * @param {number} centerJ center of the section that appears to cross
   * a finder pattern.
   * @param {number} maxCount maximum reasonable number of modules that
   * should beobserved in any reading state, based on the results of the
   * horizontal scan.
   * @param {number} originalStateCountTotal nodoc.
   * @return {number} vertical center of finder pattern, or {@link NaN}
   * if not found.
   */
  pro.crossCheckVertical = function(startI, centerJ, maxCount,
                                    originalStateCountTotal) {
    var image = this.image_;

    var maxI = image.height;
    var stateCount = this.getCrossCheckStateCount();

    // Start counting up from center
    var i = startI;
    while (i >= 0 && image.get(centerJ, i)) {
      stateCount[2]++;
      i--;
    }
    if (i < 0) {
      return NaN;
    }
    while (i >= 0 && !image.get(centerJ, i) &&
      stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }
    // If already too many modules in this state or ran off the edge:
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i >= 0 && image.get(centerJ, i) &&
      stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    i = startI + 1;
    while (i < maxI && image.get(centerJ, i)) {
      stateCount[2]++;
      i++;
    }
    if (i == maxI) {
      return NaN;
    }
    while (i < maxI && !image.get(centerJ, i) &&
      stateCount[3] < maxCount) {
      stateCount[3]++;
      i++;
    }
    if (i == maxI || stateCount[3] >= maxCount) {
      return NaN;
    }
    while (i < maxI && image.get(centerJ, i) &&
      stateCount[4] < maxCount) {
      stateCount[4]++;
      i++;
    }
    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    // If we found a finder-pattern-like section, but its size is more than
    // 40% different than the original, assume it's a false positive
    var stateCountTotal = stateCount[0] + stateCount[1] +
      stateCount[2] + stateCount[3] +
      stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >=
      2 * originalStateCountTotal) {
      return NaN;
    }

    return _.foundPatternCross(stateCount) ?
      this.centerFromEnd(stateCount, i) : NaN;
  };

  /**
   * <p>Like {@link #crossCheckVertical(int, int, int, int)}, and in fact
   * is basically identical, except it reads horizontally instead of
   * vertically. This is used to cross-cross check a vertical cross check
   * and locate the real center of the alignment pattern.</p>
   * @param {number} startJ col where a finder pattern was detected.
   * @param {number} centerI center of the section that appears to cross a
   * finder pattern.
   * @param {number} maxCount maximum reasonable number of modules that should
   * be observed in any reading state, based on the results of the horizontal
   * scan.
   * @param {number} originalStateCountTotal nodoc.
   * @return {number} horizontal center of finder pattern, or NaN if not found.
   */
  pro.crossCheckHorizontal = function(startJ, centerI, maxCount,
                                      originalStateCountTotal) {
    var image = this.image_;

    var maxJ = image.width;
    var stateCount = this.getCrossCheckStateCount();

    var j = startJ;
    while (j >= 0 && image.get(j, centerI)) {
      stateCount[2]++;
      j--;
    }
    if (j < 0) {
      return NaN;
    }
    while (j >= 0 && !image.get(j, centerI) &&
      stateCount[1] <= maxCount) {
      stateCount[1]++;
      j--;
    }
    if (j < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (j >= 0 && image.get(j, centerI) &&
      stateCount[0] <= maxCount) {
      stateCount[0]++;
      j--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }

    j = startJ + 1;
    while (j < maxJ && image.get(j, centerI)) {
      stateCount[2]++;
      j++;
    }
    if (j == maxJ) {
      return NaN;
    }
    while (j < maxJ && !image.get(j, centerI) &&
      stateCount[3] < maxCount) {
      stateCount[3]++;
      j++;
    }
    if (j == maxJ || stateCount[3] >= maxCount) {
      return NaN;
    }
    while (j < maxJ && image.get(j, centerI) &&
      stateCount[4] < maxCount) {
      stateCount[4]++;
      j++;
    }
    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    // If we found a finder-pattern-like section, but its size is
    // significantly different than
    // the original, assume it's a false positive
    var stateCountTotal = stateCount[0] + stateCount[1] +
      stateCount[2] + stateCount[3] + stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >=
      originalStateCountTotal) {
      return NaN;
    }

    return _.foundPatternCross(stateCount) ?
      this.centerFromEnd(stateCount, j) : NaN;
  };

  /**
   * <p>This is called when a horizontal scan finds a possible alignment
   * pattern. It will cross check with a vertical scan, and if successful,
   * will, ah, cross-cross-check with another horizontal scan. This is needed
   * primarily to locate the real horizontal center of the pattern in cases of
   * extreme skew.</p>
   *
   * <p>If that succeeds the finder pattern location is added to a list that
   * tracks the number of times each location has been nearly-matched as a
   * finder pattern.  Each additional find is more evidence that the location
   * is in fact a finder pattern center
   *
   * @param {Array.<number>} stateCount reading state module counts from
   * horizontal scan.
   * @param {number} i row where finder pattern may be found.
   * @param {number} j end of possible finder pattern in row.
   * @return {boolean} true if a finder pattern candidate was found this time.
   */
  pro.handlePossibleCenter = function(stateCount, i, j) {
    var stateCountTotal = stateCount[0] + stateCount[1] +
      stateCount[2] + stateCount[3] + stateCount[4];
    var centerJ = this.centerFromEnd(stateCount, j);
    var centerI = this.crossCheckVertical(i, Math.floor(centerJ),
      stateCount[2], stateCountTotal);
    if (!isNaN(centerI)) {
      // Re-cross check
      centerJ = this.crossCheckHorizontal(Math.floor(centerJ),
        Math.floor(centerI), stateCount[2], stateCountTotal);
      if (!isNaN(centerJ)) {
        var estimatedModuleSize = stateCountTotal / 7.;
        var found = false;
        for (var index = 0; index < this.possibleCenters_.length; index++) {
          var center = this.possibleCenters_[index];
          // Look for about the same center and module size:
          if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
            this.possibleCenters_[index] =
              center.combineEstimate(centerI, centerJ, estimatedModuleSize);
            found = true;
            break;
          }
        }
        if (!found) {
          var point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
          this.possibleCenters_.push(point);
          if (this.resultPointCallback_ != null) {
            this.resultPointCallback_(point);
          }
        }
        return true;
      }
    }
    return false;
  };

  /**
   * @return {number} number of rows we could safely skip during scanning,
   * based on the first two finder patterns that have been located. In some
   * cases their position will allow us to infer that the third pattern must
   * lie below a certain point farther down in the image.
   */
  pro.findRowSkip = function() {
    var max = this.possibleCenters_.length;
    if (max <= 1) {
      return 0;
    }
    var firstConfirmedCenter = null;
    for (var i = 0; i < this.possibleCenters_.length; ++i) {
      var center = this.possibleCenters_[i];
      if (center.getCount() >= _.CENTER_QUORUM) {
        if (firstConfirmedCenter == null) {
          firstConfirmedCenter = center;
        } else {
          // We have two confirmed centers
          // How far down can we skip before resuming looking for the next
          // pattern? In the worst case, only the difference between the
          // difference in the x / y coordinates of the two centers.
          // This is the case where you find top left last.
          this.hasSkipped_ = true;
          return Math.floor((
            Math.abs(firstConfirmedCenter.getX() - center.getX()) -
              Math.abs(firstConfirmedCenter.getY() - center.getY())) / 2);
        }
      }
    }
    return 0;
  };

  /**
   * @return {boolean} true iff we have found at least 3 finder patterns that
   * have been detected at least {@link #CENTER_QUORUM} times each, and
   * , the estimated module size of the candidates is "pretty similar".
   */
  pro.haveMultiplyConfirmedCenters = function() {
    var confirmedCount = 0;
    var totalModuleSize = 0.;
    var max = this.possibleCenters_.length;
    this.possibleCenters_.forEach(function(pattern) {
      if (pattern.getCount() >= _.CENTER_QUORUM) {
        confirmedCount++;
        totalModuleSize += pattern.getEstimatedModuleSize();
      }
    }, this);
    if (confirmedCount < 3) {
      return false;
    }
    // OK, we have at least 3 confirmed centers, but, it's possible that one
    // is a "false positive"
    // and that we need to keep looking. We detect this by asking if the
    // estimated module sizes
    // vary too much. We arbitrarily say that when the total deviation
    // from average exceeds
    // 5% of the total module size estimates, it's too much.
    // manu: Does it make sense to divide by max while counting
    // only those with >= CENTER_QUORUM.
    var average = totalModuleSize / max;
    var totalDeviation = 0.;
    this.possibleCenters_.forEach(function(pattern) {
      totalDeviation += Math.abs(pattern.getEstimatedModuleSize() - average);
    });
    if (totalDeviation > 0.05 * totalModuleSize)
      return false;

    // Check skew of best patterns.
    var centers = this.selectBestPatterns();
    var skew = _.computeSkew(centers);

    return skew < _.SKEW_THRESHOLD;
  };

  /**
   * @param {boolean=} opt_checkSkew check skew, defaults to false.
   * @return {Array.<FinderPattern>} the 3 best FinderPatterns from our list
   * of candidates. The "best" are those that have been detected at
   * least CENTER_QUORUM times, and whose module size differs from the
   * average among those patterns the least.
   */
  pro.selectBestPatterns = function(opt_checkSkew) {
    var startSize = this.possibleCenters_.length;
    if (startSize < 3) {
      // Couldn't find enough finder patterns
      throw new w69b.qr.NotFoundError();
    }
    var average;
    var centers = goog.array.clone(this.possibleCenters_);

    // Filter outlier possibilities whose module size is too different
    if (startSize > 3) {
      // But we can only afford to do so if we have at least 4 possibilities
      // to choose from
      var totalModuleSize = 0.;
      var square = 0.;
      centers.forEach(function(center) {
        var size = center.getEstimatedModuleSize();
        totalModuleSize += size;
        square += size * size;
      });
      average = totalModuleSize / startSize;
      var stdDev = Math.sqrt(square / startSize - average * average);

      centers.sort(_.FurthestFromAverageComparator(average));

      var limit = Math.max(0.2 * average, stdDev);

      for (var i = 0; i < centers.length &&
        centers.length > 3; i++) {
        var pattern = centers[i];
        if (Math.abs(pattern.getEstimatedModuleSize() - average) > limit) {
          goog.array.removeAt(centers, i);
          i--;
        }
      }
    }

    if (centers.length > 3) {
      // Throw away all but those first size candidate points we found.

      totalModuleSize = 0.;
      centers.forEach(function(possibleCenter) {
        totalModuleSize += possibleCenter.getEstimatedModuleSize();
      });

      average = totalModuleSize / centers.length;

      centers.sort(_.CenterComparator(average));

      if (opt_checkSkew) {
        // check skew error of first few sets.
        var withSkew = _.getCombinations(centers).map(function(combination) {
          return {centers: combination,
            skew: _.computeSkew(combination)};
        });
        withSkew.sort(function(a, b) {
          return goog.array.defaultCompare(a.skew, b.skew);
        });
        // pick canidates with lowest skew.
        centers = withSkew[0].centers;
      } else {
        centers = centers.slice(0, 3);
      }


    }

    return centers;
  };

  /**
   * Get c
   * @param {Array.<FinderPattern>} centers finder pattern candidates.
   * @return {Array.<Array.<FinderPattern>>} result.
   */
  _.getCombinations = function(centers) {
    var len = centers.length;
    var result = [];
    _.SKEW_COMBINATIONS.forEach(function(indices) {
      if (indices[0] < len && indices[1] && len && indices[2] < len) {
        result.push([centers[indices[0]], centers[indices[1]],
          centers[indices[2]]]);
      }
    });
    return result;
  };

  /**
   * <p>Orders by furthest from average</p>
   * @param {number} average average.
   * @return {function(FinderPattern, FinderPattern):number} compare function.
   */
  _.FurthestFromAverageComparator = function(average) {
    return function(center1, center2) {
      var dA = Math.abs(center2.getEstimatedModuleSize() - average);
      var dB = Math.abs(center1.getEstimatedModuleSize() - average);
      return dA < dB ? -1 : dA == dB ? 0 : 1;
    };
  };

  /**
   * <p>Orders by {@link FinderPattern#getCount()}, descending.</p>
   * @param {number} average average.
   * @return {function(FinderPattern, FinderPattern):number} compare function.
   */
  _.CenterComparator = function(average) {
    return function(center1, center2) {
      if (center2.getCount() == center1.getCount()) {
        var dA = Math.abs(center2.getEstimatedModuleSize() - average);
        var dB = Math.abs(center1.getEstimatedModuleSize() - average);
        return dA < dB ? 1 : dA == dB ? 0 : -1;
      } else {
        return center2.getCount() - center1.getCount();
      }
    };
  };

  /**
   * Computes a - b / |a-b|.
   * @param {w69b.qr.ResultPoint} pattern1 a.
   * @param {w69b.qr.ResultPoint} pattern2 b.
   * @return {Array.<number>} result as array [x, y].
   */
  _.diff = function(pattern1, pattern2) {
    var diffX = pattern1.getX() - pattern2.getX();
    var diffY = pattern1.getY() - pattern2.getY();
    var len = Math.sqrt(diffX * diffX + diffY * diffY);
    return [diffX / len, diffY / len];
  };

  /**
   * Scalar product
   * @param {Array.<number>} a vector a.
   * @param {Array.<number>} b vector a.
   * @return {number} scalar product.
   */
  _.scalarProduct = function(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  };

  // Square root of 1/2
  _.SQRT_05 = Math.sqrt(0.5);
  /**
   * Computes a number that expresses how good alignement of the givevn
   * patterns can be explained by a simliarity transformation. This
   * assumes that they are oriented in triangular shape.
   * @param {Array.<w69b.qr.ResultPoint>} patterns array of size 3.
   * @return {number} skew error.
   */
  _.computeSkew = function(patterns) {
    var diff01 = _.diff(patterns[0], patterns[1]);
    var diff02 = _.diff(patterns[0], patterns[2]);
    var diff12 = _.diff(patterns[1], patterns[2]);
    var scalars = [Math.abs(_.scalarProduct(diff01, diff02)),
      Math.abs(_.scalarProduct(diff01, diff12)),
      Math.abs(_.scalarProduct(diff02, diff12))
    ];

    scalars.sort();
    var error = scalars[0] +
      Math.abs(scalars[1] - _.SQRT_05) +
      Math.abs(scalars[2] - _.SQRT_05);
    return error;
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.MathUtils');

goog.scope(function() {
  var _ = w69b.qr.MathUtils;

  /**
   * Euclidean distance.
   */
  _.distance = function(aX, aY, bX, bY) {
    var xDiff = aX - bX;
    var yDiff = aY - bY;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  };


});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.Version');
goog.require('w69b.qr.BitMatrix');
goog.require('w69b.qr.FormatError');

goog.scope(function() {
  var FormatError = w69b.qr.FormatError;
  /**
   * @constructor
   */
  w69b.qr.ECB = function(count, dataCodewords) {
    this.count = count;
    this.dataCodewords = dataCodewords;
  };
  var ECB = w69b.qr.ECB;

  /**
   * @constructor
   * @param {number} ecCodewordsPerBlock code words per block.
   * @param {!ECB} ecBlocks1 block1.
   * @param {ECB=} opt_ecBlocks2 block2.
   */
  w69b.qr.ECBlocks = function(ecCodewordsPerBlock, ecBlocks1, opt_ecBlocks2) {
    this.ecCodewordsPerBlock = ecCodewordsPerBlock;
    if (opt_ecBlocks2)
      this.ecBlocks = [ecBlocks1, opt_ecBlocks2];
    else
      this.ecBlocks = [ecBlocks1];

  };
  var ECBlocks = w69b.qr.ECBlocks;

  ECBlocks.prototype.getECBlocks = function() {
    return this.ecBlocks;
  };

  ECBlocks.prototype.getTotalECCodewords = function() {
    return this.ecCodewordsPerBlock * this.getNumBlocks();
  };

  ECBlocks.prototype.getNumBlocks = function() {
    var total = 0;
    for (var i = 0; i < this.ecBlocks.length; i++) {
      total += this.ecBlocks[i].count;
    }
    return total;
  };

  /**
   * @constructor
   */
  w69b.qr.Version = function(versionNumber, alignmentPatternCenters, ecBlocks1,
                             ecBlocks2, ecBlocks3, ecBlocks4) {
    /**
     * @type {number}
     */
    this.versionNumber = versionNumber;
    this.alignmentPatternCenters = alignmentPatternCenters;
    this.ecBlocks = new Array(ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4);

    var total = 0;
    var ecCodewords = ecBlocks1.ecCodewordsPerBlock;
    var ecbArray = ecBlocks1.getECBlocks();
    for (var i = 0; i < ecbArray.length; i++) {
      var ecBlock = ecbArray[i];
      total += ecBlock.count * (ecBlock.dataCodewords + ecCodewords);
    }
    this.totalCodewords = total;
  };
  var Version = w69b.qr.Version;
  var pro = Version.prototype;

  pro.getVersionNumber = function() {
    return this.versionNumber;
  };

  pro.getTotalCodewords = function() {
    return this.totalCodewords;
  };

  /**
   * @return {string} debug string.
   */
  pro.toString = function() {
    return '' + this.versionNumber;
  };

  /**
   * @return {number} dimension.
   */
  pro.getDimensionForVersion = function() {
    return 17 + 4 * this.versionNumber;
  };

  pro.buildFunctionPattern = function() {
    var dimension = this.getDimensionForVersion();
    var bitMatrix = new w69b.qr.BitMatrix(dimension);

    // Top left finder pattern + separator + format
    bitMatrix.setRegion(0, 0, 9, 9);
    // Top right finder pattern + separator + format
    bitMatrix.setRegion(dimension - 8, 0, 8, 9);
    // Bottom left finder pattern + separator + format
    bitMatrix.setRegion(0, dimension - 8, 9, 8);

    // Alignment patterns
    var max = this.alignmentPatternCenters.length;
    for (var x = 0; x < max; x++) {
      var i = this.alignmentPatternCenters[x] - 2;
      for (var y = 0; y < max; y++) {
        if ((x == 0 && (y == 0 || y == max - 1)) || (x == max - 1 && y == 0)) {
          // No alignment patterns near the three finder paterns
          continue;
        }
        bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
      }
    }

    // Vertical timing pattern
    bitMatrix.setRegion(6, 9, 1, dimension - 17);
    // Horizontal timing pattern
    bitMatrix.setRegion(9, 6, dimension - 17, 1);

    if (this.versionNumber > 6) {
      // Version info, top right
      bitMatrix.setRegion(dimension - 11, 0, 3, 6);
      // Version info, bottom left
      bitMatrix.setRegion(0, dimension - 11, 6, 3);
    }

    return bitMatrix;
  };
  pro.getECBlocksForLevel = function(ecLevel) {
    return this.ecBlocks[ecLevel.ordinal];
  };

  Version.VERSION_DECODE_INFO = new Array(0x07C94, 0x085BC, 0x09A99, 0x0A4D3,
    0x0BBF6, 0x0C762, 0x0D847, 0x0E60D, 0x0F928, 0x10B78, 0x1145D, 0x12A17,
    0x13532, 0x149A6, 0x15683, 0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB,
    0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250, 0x209D5, 0x216F0, 0x228BA,
    0x2379F, 0x24B0B, 0x2542E, 0x26A64, 0x27541, 0x28C69);

  Version.VERSIONS = function() {
    return new Array(new Version(1, [],
      new ECBlocks(7, new ECB(1, 19)),
      new ECBlocks(10, new ECB(1, 16)), new ECBlocks(13, new ECB(1, 13)),
      new ECBlocks(17, new ECB(1, 9))),
      new Version(2, new Array(6, 18), new ECBlocks(10, new ECB(1, 34)),
        new ECBlocks(16, new ECB(1, 28)), new ECBlocks(22, new ECB(1, 22)),
        new ECBlocks(28, new ECB(1, 16))),
      new Version(3, new Array(6, 22), new ECBlocks(15, new ECB(1, 55)),
        new ECBlocks(26, new ECB(1, 44)), new ECBlocks(18, new ECB(2, 17)),
        new ECBlocks(22, new ECB(2, 13))),
      new Version(4, new Array(6, 26), new ECBlocks(20, new ECB(1, 80)),
        new ECBlocks(18, new ECB(2, 32)), new ECBlocks(26, new ECB(2, 24)),
        new ECBlocks(16, new ECB(4, 9))),
      new Version(5, new Array(6, 30), new ECBlocks(26, new ECB(1, 108)),
        new ECBlocks(24, new ECB(2, 43)),
        new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)),
        new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))),
      new Version(6, new Array(6, 34), new ECBlocks(18, new ECB(2, 68)),
        new ECBlocks(16, new ECB(4, 27)), new ECBlocks(24, new ECB(4, 19)),
        new ECBlocks(28, new ECB(4, 15))),
      new Version(7, new Array(6, 22, 38), new ECBlocks(20, new ECB(2, 78)),
        new ECBlocks(18, new ECB(4, 31)),
        new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)),
        new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))),
      new Version(8, new Array(6, 24, 42), new ECBlocks(24, new ECB(2, 97)),
        new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)),
        new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)),
        new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))),
      new Version(9, new Array(6, 26, 46), new ECBlocks(30, new ECB(2, 116)),
        new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)),
        new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)),
        new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))),
      new Version(10, new Array(6, 28, 50),
        new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)),
        new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)),
        new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)),
        new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))),
      new Version(11, new Array(6, 30, 54), new ECBlocks(20, new ECB(4, 81)),
        new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)),
        new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)),
        new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))),
      new Version(12, new Array(6, 32, 58),
        new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)),
        new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)),
        new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)),
        new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))),
      new Version(13, new Array(6, 34, 62), new ECBlocks(26, new ECB(4, 107)),
        new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)),
        new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)),
        new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))),
      new Version(14, new Array(6, 26, 46, 66),
        new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)),
        new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)),
        new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)),
        new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))),
      new Version(15, new Array(6, 26, 48, 70),
        new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)),
        new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)),
        new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)),
        new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))),
      new Version(16, new Array(6, 26, 50, 74),
        new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)),
        new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)),
        new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)),
        new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))),
      new Version(17, new Array(6, 30, 54, 78),
        new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)),
        new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)),
        new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)),
        new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))),
      new Version(18, new Array(6, 30, 56, 82),
        new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)),
        new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)),
        new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)),
        new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))),
      new Version(19, new Array(6, 30, 58, 86),
        new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)),
        new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)),
        new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)),
        new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))),
      new Version(20, new Array(6, 34, 62, 90),
        new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)),
        new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)),
        new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)),
        new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))),
      new Version(21, new Array(6, 28, 50, 72, 94),
        new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)),
        new ECBlocks(26, new ECB(17, 42)),
        new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)),
        new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))),
      new Version(22, new Array(6, 26, 50, 74, 98),
        new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)),
        new ECBlocks(28, new ECB(17, 46)),
        new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)),
        new ECBlocks(24, new ECB(34, 13))),
      new Version(23, new Array(6, 30, 54, 74, 102),
        new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)),
        new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)),
        new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)),
        new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))),
      new Version(24, new Array(6, 28, 54, 80, 106),
        new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)),
        new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)),
        new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)),
        new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))),
      new Version(25, new Array(6, 32, 58, 84, 110),
        new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)),
        new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)),
        new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)),
        new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))),
      new Version(26, new Array(6, 30, 58, 86, 114),
        new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)),
        new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)),
        new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)),
        new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))),
      new Version(27, new Array(6, 34, 62, 90, 118),
        new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)),
        new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)),
        new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)),
        new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))),
      new Version(28, new Array(6, 26, 50, 74, 98, 122),
        new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)),
        new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)),
        new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)),
        new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))),
      new Version(29, new Array(6, 30, 54, 78, 102, 126),
        new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)),
        new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)),
        new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)),
        new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))),
      new Version(30, new Array(6, 26, 52, 78, 104, 130),
        new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)),
        new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)),
        new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)),
        new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))),
      new Version(31, new Array(6, 30, 56, 82, 108, 134),
        new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)),
        new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)),
        new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)),
        new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))),
      new Version(32, new Array(6, 34, 60, 86, 112, 138),
        new ECBlocks(30, new ECB(17, 115)),
        new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)),
        new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)),
        new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))),
      new Version(33, new Array(6, 30, 58, 86, 114, 142),
        new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)),
        new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)),
        new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)),
        new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))),
      new Version(34, new Array(6, 34, 62, 90, 118, 146),
        new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)),
        new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)),
        new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)),
        new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))),
      new Version(35, new Array(6, 30, 54, 78, 102, 126, 150),
        new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)),
        new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)),
        new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)),
        new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))),
      new Version(36, new Array(6, 24, 50, 76, 102, 128, 154),
        new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)),
        new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)),
        new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)),
        new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))),
      new Version(37, new Array(6, 28, 54, 80, 106, 132, 158),
        new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)),
        new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)),
        new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)),
        new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))),
      new Version(38, new Array(6, 32, 58, 84, 110, 136, 162),
        new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)),
        new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)),
        new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)),
        new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))),
      new Version(39, new Array(6, 26, 54, 82, 110, 138, 166),
        new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)),
        new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)),
        new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)),
        new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))),
      new Version(40, new Array(6, 30, 58, 86, 114, 142, 170),
        new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)),
        new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)),
        new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)),
        new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))));
  }();

  Version.getVersionForNumber = function(versionNumber) {
    if (versionNumber < 1 || versionNumber > 40) {
      throw new FormatError();
    }
    return Version.VERSIONS[versionNumber - 1];
  };

  Version.getProvisionalVersionForDimension = function(dimension) {
    if (dimension % 4 != 1) {
      throw new FormatError();
    }
    return Version.getVersionForNumber((dimension - 17) >> 2);
  };

  Version.decodeVersionInformation = function(versionBits) {
    var bestDifference = 0xffffffff;
    var bestVersion = 0;
    for (var i = 0; i < Version.VERSION_DECODE_INFO.length; i++) {
      var targetVersion = Version.VERSION_DECODE_INFO[i];
      // Do the version info bits match exactly? done.
      if (targetVersion == versionBits) {
        return Version.getVersionForNumber(i + 7);
      }
      // Otherwise see if this is the closest to a real version info bit string
      // we have seen so far
      var bitsDifference = w69b.qr.FormatInformation.numBitsDiffering(
        versionBits, targetVersion);
      if (bitsDifference < bestDifference) {
        bestVersion = i + 7;
        bestDifference = bitsDifference;
      }
    }
    // We can tolerate up to 3 bits of error since no two version info codewords
    // will differ in less than 4 bits.
    if (bestDifference <= 3) {
      return Version.getVersionForNumber(bestVersion);
    }
    // If we didn't find a close enough match, fail
    return null;
  };
});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.Detector');
goog.require('w69b.img.BitMatrixLike');
goog.require('w69b.qr.AlignmentPattern');
goog.require('w69b.qr.AlignmentPatternFinder');
goog.require('w69b.qr.BitMatrix');
goog.require('w69b.qr.DefaultGridSampler');
goog.require('w69b.qr.FinderPatternFinder');
goog.require('w69b.qr.MathUtils');
goog.require('w69b.qr.NotFoundError');
goog.require('w69b.qr.Version');


goog.scope(function() {
  var Version = w69b.qr.Version;
  var PerspectiveTransform = w69b.qr.PerspectiveTransform;
  var NotFoundError = w69b.qr.NotFoundError;
  var MathUtils = w69b.qr.MathUtils;
  var AlignmentPattern = w69b.qr.AlignmentPattern;

  /**
   * @constructor
   */
  w69b.qr.DetectorResult = function(bits, points) {
    this.bits = bits;
    this.points = points;
  };
  var DetectorResult = w69b.qr.DetectorResult;

  /**
   * Encapsulates logic that can detect a QR Code in an image, even if the
   * QR Code is rotated or skewed, or partially obscured.
   *
   * @author Sean Owen
   * @author mb@w69b.com (Manuel Braun) - ported to js
   *
   * @constructor
   * @param {!w69b.img.BitMatrixLike} image the image.
   * @param {?w69b.qr.ResultPointCallback=} opt_callback callback.
   */
  w69b.qr.Detector = function(image, opt_callback) {
    /**
     * @type {!w69b.img.BitMatrixLike}
     */
    this.image = image;
    this.resultPointCallback = opt_callback || null;
  };
  var pro = w69b.qr.Detector.prototype;

  /**
   * <p>This method traces a line from a point in the image, in the
   * direction towards another point.
   * It begins in a black region, and keeps going until it finds white,
   * then black, then white again.
   * It reports the distance from the start to this point.</p>
   *
   * <p>This is used when figuring out how wide a finder pattern is,
   * when the finder pattern may be skewed or rotated.</p>
   */
  /**
   * <p>This method traces a line from a point in the image, in the direction
   * towards another point.
   * It begins in a black region, and keeps going until it finds white, then
   * black, then white again.
   * It reports the distance from the start to this point.</p>
   *
   * <p>This is used when figuring out how wide a finder pattern is, when the
   * finder pattern
   * may be skewed or rotated.</p>
   */
  pro.sizeOfBlackWhiteBlackRun = function(fromX, fromY, toX, toY) {
    // Mild variant of Bresenham's algorithm;
    // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
    var steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
    if (steep) {
      var temp = fromX;
      fromX = fromY;
      fromY = temp;
      temp = toX;
      toX = toY;
      toY = temp;
    }

    var dx = Math.abs(toX - fromX);
    var dy = Math.abs(toY - fromY);
    var error = -dx >> 1;
    var xstep = fromX < toX ? 1 : -1;
    var ystep = fromY < toY ? 1 : -1;

    // In black pixels, looking for white, first or second time.
    var state = 0;
    // Loop up until x == toX, but not beyond
    var xLimit = toX + xstep;
    for (var x = fromX, y = fromY; x != xLimit; x += xstep) {
      var realX = steep ? y : x;
      var realY = steep ? x : y;

      // Does current pixel mean we have moved white to black or vice versa?
      // Scanning black in state 0,2 and white in state 1, so if we find
      // the wrong
      // color, advance to next state or end if we are in state 2 already
      if ((state == 1) == !!this.image.get(realX, realY)) {
        if (state == 2) {
          return MathUtils.distance(x, y, fromX, fromY);
        }
        state++;
      }

      error += dy;
      if (error > 0) {
        if (y == toY) {
          break;
        }
        y += ystep;
        error -= dx;
      }
    }
    // Found black-white-black; give the benefit of the doubt that the next
    // pixel outside the image
    // is "white" so this last point at (toX+xStep,toY) is the right ending.
    // This is really a
    // small approximation; (toX+xStep,toY+yStep) might be really correct.
    // Ignore this.
    if (state == 2) {
      return MathUtils.distance(toX + xstep, toY, fromX, fromY);
    }
    // else we didn't find even black-white-black; no estimate is really
    // possible
    return NaN;
  };


  /**
   * See {@link #sizeOfBlackWhiteBlackRun(int, int, int, int)}; computes
   * the total width of
   * a finder pattern by looking for a black-white-black run from the center
   * in the direction
   * of another point (another finder pattern center), and in the opposite
   * direction too.</p>
   */
  pro.sizeOfBlackWhiteBlackRunBothWays = function(fromX, fromY, toX, toY) {

    var result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

    // Now count other way -- don't run off image though of course
    var scale = 1.0;
    var otherToX = fromX - (toX - fromX);
    if (otherToX < 0) {
      scale = fromX / (fromX - otherToX);
      otherToX = 0;
    } else if (otherToX >= this.image.width) {
      scale = (this.image.width - 1 - fromX) / (otherToX - fromX);
      otherToX = this.image.width - 1;
    }
    var otherToY = Math.floor(fromY - (toY - fromY) * scale);

    scale = 1.0;
    if (otherToY < 0) {
      scale = fromY / (fromY - otherToY);
      otherToY = 0;
    } else if (otherToY >= this.image.height) {
      scale = (this.image.height - 1 - fromY) / (otherToY - fromY);
      otherToY = this.image.height - 1;
    }
    otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

    result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
    return result - 1.0; // -1 because we counted the middle pixel twice
  };

  /**
   * <p>Estimates module size based on two finder patterns -- it uses
   * {@link #sizeOfBlackWhiteBlackRunBothWays(int, int, int, int)} to
   * figure the
   * width of each, measuring along the axis between their centers.</p>
   */
  pro.calculateModuleSizeOneWay = function(pattern, otherPattern) {
    var moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(
      Math.floor(pattern.x),
      Math.floor(pattern.y), Math.floor(otherPattern.x),
      Math.floor(otherPattern.y));
    var moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(
      Math.floor(otherPattern.x),
      Math.floor(otherPattern.y), Math.floor(pattern.x),
      Math.floor(pattern.y));
    if (isNaN(moduleSizeEst1)) {
      return moduleSizeEst2 / 7.0;
    }
    if (isNaN(moduleSizeEst2)) {
      return moduleSizeEst1 / 7.0;
    }
    // Average them, and divide by 7 since we've counted the width of 3 black
    // modules, and 1 white and 1 black module on either side. Ergo, divide sum
    // by 14.
    return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
  };

  /**
   * <p>Computes an average estimated module size based on estimated derived
   * from the positions of the three finder patterns.</p>
   */
  pro.calculateModuleSize = function(topLeft, topRight, bottomLeft) {
    // Take the average
    return (this.calculateModuleSizeOneWay(topLeft,
      topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
  };

  pro.distance = function(pattern1, pattern2) {
    var xDiff = pattern1.x - pattern2.x;
    var yDiff = pattern1.y - pattern2.y;
    return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
  };

  pro.computeDimension = function(topLeft, topRight, bottomLeft, moduleSize) {

    var tltrCentersDimension = this.distance(topLeft,
      topRight) / moduleSize;
    var tlblCentersDimension = this.distance(topLeft,
      bottomLeft) / moduleSize;
    var dimension = Math.round((
      tltrCentersDimension + tlblCentersDimension) / 2) + 7;
    switch (dimension % 4) {
      // mod 4
      case 0:
        dimension++;
        break;
      // 1? do nothing

      case 2:
        dimension--;
        break;

      case 3:
        // would it be better to do something like dimension += 2; ?
        // throw new NotFoundError();
        dimension += 2;
    }
    // Sometimes dimension is 17 - which is invalid. Why?
    return dimension;
  };

  /**
   * <p>Attempts to locate an alignment pattern in a limited region of the
   * image, which is
   * guessed to contain it. This method uses {@link AlignmentPattern}.</p>
   *
   * @param {number} overallEstModuleSize estimated module size so far.
   * @param {number} estAlignmentX x coordinate of center of area probably
   * containing alignment pattern.
   * @param {number} estAlignmentY y coordinate of above.
   * @param {number} allowanceFactor number of pixels in all directions to
   * search from the center.
   * @return {AlignmentPattern} if found, or null otherwise.
   */
  pro.findAlignmentInRegion = function(overallEstModuleSize, estAlignmentX,
                                       estAlignmentY, allowanceFactor) {
    // Look for an alignment pattern (3 modules in size) around where it
    // should be
    var allowance = Math.floor(allowanceFactor * overallEstModuleSize);
    var alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
    var alignmentAreaRightX = Math.min(this.image.width - 1,
      estAlignmentX + allowance);
    if (alignmentAreaRightX - alignmentAreaLeftX <
      overallEstModuleSize * 3) {
      throw new NotFoundError();
    }

    var alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
    var alignmentAreaBottomY = Math.min(this.image.height - 1,
      estAlignmentY + allowance);

    var alignmentFinder = new w69b.qr.AlignmentPatternFinder(this.image,
      alignmentAreaLeftX, alignmentAreaTopY,
      alignmentAreaRightX - alignmentAreaLeftX,
      alignmentAreaBottomY - alignmentAreaTopY, overallEstModuleSize,
      this.resultPointCallback);
    return alignmentFinder.find();
  };

  pro.createTransform = function(topLeft, topRight, bottomLeft,
                                 alignmentPattern, dimension) {
    var dimMinusThree = dimension - 3.5;
    var bottomRightX;
    var bottomRightY;
    var sourceBottomRightX;
    var sourceBottomRightY;
    if (alignmentPattern != null) {
      bottomRightX = alignmentPattern.x;
      bottomRightY = alignmentPattern.y;
      sourceBottomRightX = sourceBottomRightY = dimMinusThree - 3.0;
    } else {
      // Don't have an alignment pattern, just make up the bottom-right point
      bottomRightX = (topRight.x - topLeft.x) + bottomLeft.x;
      bottomRightY = (topRight.y - topLeft.y) + bottomLeft.y;
      sourceBottomRightX = sourceBottomRightY = dimMinusThree;
    }

    var transform = PerspectiveTransform.quadrilateralToQuadrilateral(3.5,
      3.5,
      dimMinusThree, 3.5, sourceBottomRightX, sourceBottomRightY, 3.5,
      dimMinusThree, topLeft.x, topLeft.y, topRight.x, topRight.y,
      bottomRightX,
      bottomRightY, bottomLeft.x, bottomLeft.y);

    return transform;
  };

  pro.sampleGrid = function(image, transform, dimension) {
    var sampler = w69b.qr.GridSampler.getInstance();
    return sampler.sampleGridTransform(image, dimension, dimension, transform);
  };

  /**
   * TODO.
   * @param {w69b.qr.FinderPatternInfo} info info.
   * @return {!w69b.qr.DetectorResult} result.
   */
  pro.processFinderPatternInfo = function(info) {

    var topLeft = info.topLeft;
    var topRight = info.topRight;
    var bottomLeft = info.bottomLeft;

    var moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
    if (moduleSize < 1.0) {
      throw new NotFoundError();
    }
    var dimension = this.computeDimension(topLeft, topRight, bottomLeft,
      moduleSize);
    var provisionalVersion = Version.getProvisionalVersionForDimension(
      dimension);
    var modulesBetweenFPCenters =
      provisionalVersion.getDimensionForVersion() - 7;

    var alignmentPattern = null;
    // Anything above version 1 has an alignment pattern
    if (provisionalVersion.alignmentPatternCenters.length > 0) {

      // Guess where a "bottom right" finder pattern would have been
      var bottomRightX = topRight.x - topLeft.x + bottomLeft.x;
      var bottomRightY = topRight.y - topLeft.y + bottomLeft.y;

      // Estimate that alignment pattern is closer by 3 modules
      // from "bottom right" to known top left location
      var correctionToTopLeft = 1.0 - 3.0 / modulesBetweenFPCenters;
      var estAlignmentX = Math.floor(topLeft.x +
        correctionToTopLeft * (bottomRightX - topLeft.x));
      var estAlignmentY = Math.floor(topLeft.y +
        correctionToTopLeft * (bottomRightY - topLeft.y));

      // Kind of arbitrary -- expand search radius before giving up
      for (var i = 4; i <= 16; i *= 2) {
        try {
          alignmentPattern =
            this.findAlignmentInRegion(moduleSize, estAlignmentX,
              estAlignmentY, i);
          break;
        }
        catch (err) {
          if (!(err instanceof NotFoundError))
            throw err;
          // try next round
        }
      }
      // If we didn't find alignment pattern... well try anyway without it
    }

    var transform = this.createTransform(topLeft, topRight, bottomLeft,
      alignmentPattern, dimension);

    var bits = this.sampleGrid(this.image, transform, dimension);

    var points;
    if (alignmentPattern == null) {
      points = [bottomLeft, topLeft, topRight];
    } else {
      points = [bottomLeft, topLeft, topRight, alignmentPattern];
    }
    return new DetectorResult(bits, points);
  };


  /**
   * @return {!w69b.qr.DetectorResult} result.
   */
  pro.detect = function() {
    var info = new w69b.qr.FinderPatternFinder(this.image,
      this.resultPointCallback).find();
    return this.processFinderPatternInfo(info);
  };
});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.ErrorCorrectionLevel');

goog.scope(function() {
  /**
   * See ISO 18004:2006, 6.5.1. This enum encapsulates the four error
   * correction levels defined by the QR code standard.
   *
   * @author Sean Owen
   * @author mb@w69b.com (Manuel Braun)
   *
   * @constructor
   */
  w69b.qr.ErrorCorrectionLevel = function(ordinal, bits, name) {
    this.ordinal = ordinal;
    this.bits = bits;
    this.name = name;
  };
  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;

  ErrorCorrectionLevel.L = new ErrorCorrectionLevel(0, 0x01, 'L');
  ErrorCorrectionLevel.M = new ErrorCorrectionLevel(1, 0x00, 'M');
  ErrorCorrectionLevel.Q = new ErrorCorrectionLevel(2, 0x03, 'Q');
  ErrorCorrectionLevel.H = new ErrorCorrectionLevel(3, 0x02, 'H');
  ErrorCorrectionLevel.FOR_BITS = [
    ErrorCorrectionLevel.M,
    ErrorCorrectionLevel.L,
    ErrorCorrectionLevel.H,
    ErrorCorrectionLevel.Q];

  /**
   * get by name.
   * @param {string} name one of 'L', 'M', 'Q', 'H';.
   * @return {ErrorCorrectionLevel} ec level or null if name is invalid.
   */
  ErrorCorrectionLevel.getByName = function(name) {
    var map = {'L': ErrorCorrectionLevel.L,
      'M': ErrorCorrectionLevel.M,
      'Q': ErrorCorrectionLevel.Q,
      'H': ErrorCorrectionLevel.H};
    if (map.hasOwnProperty(name)) {
      return map[name];
    } else {
      return null;
    }
  };

  var pro = ErrorCorrectionLevel.prototype;

  pro.getBits = function() {
    return this.bits;
  };

  /**
   * @return {string} debug string.
   */
  pro.toString = function() {
    return this.name;
  };

  /**
   * @param {number} bits int containing the two bits encoding a QR Code's
   * error correction level.
   * @return {!ErrorCorrectionLevel} representing the encoded error
   * correction level.
   */
  ErrorCorrectionLevel.forBits = function(bits) {
    if (bits < 0 || bits >= ErrorCorrectionLevel.FOR_BITS.length) {
      throw new Error();
    }
    return ErrorCorrectionLevel.FOR_BITS[bits];
  };
});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.FormatInformation');
goog.provide('w69b.qr.URShift');
goog.require('w69b.qr.ErrorCorrectionLevel');

goog.scope(function() {


  /**
   *
   * @param {number} number todo.
   * @param {number} bits todo.
   * @return {number} todo.
   */
  w69b.qr.URShift = function(number, bits) {
    if (number >= 0)
      return number >> bits;
    else
      return (number >> bits) + (2 << ~bits);
  };
  var URShift = w69b.qr.URShift;


  /**
   * @param {number} formatInfo format information.
   * @constructor
   */
  w69b.qr.FormatInformation = function(formatInfo) {
    this.errorCorrectionLevel =
      w69b.qr.ErrorCorrectionLevel.forBits((formatInfo >> 3) & 0x03);
    this.dataMask = (formatInfo & 0x07);
  };
  var FormatInformation = w69b.qr.FormatInformation;
  var pro = FormatInformation.prototype;

  FormatInformation.FORMAT_INFO_MASK_QR = 0x5412;
  FormatInformation.FORMAT_INFO_DECODE_LOOKUP = [
    [0x5412, 0x00],
    [0x5125, 0x01],
    [0x5E7C, 0x02],
    [0x5B4B, 0x03],
    [0x45F9, 0x04],
    [0x40CE, 0x05],
    [0x4F97, 0x06],
    [0x4AA0, 0x07],
    [0x77C4, 0x08],
    [0x72F3, 0x09],
    [0x7DAA, 0x0A],
    [0x789D, 0x0B],
    [0x662F, 0x0C],
    [0x6318, 0x0D],
    [0x6C41, 0x0E],
    [0x6976, 0x0F],
    [0x1689, 0x10],
    [0x13BE, 0x11],
    [0x1CE7, 0x12],
    [0x19D0, 0x13],
    [0x0762, 0x14],
    [0x0255, 0x15],
    [0x0D0C, 0x16],
    [0x083B, 0x17],
    [0x355F, 0x18],
    [0x3068, 0x19],
    [0x3F31, 0x1A],
    [0x3A06, 0x1B],
    [0x24B4, 0x1C],
    [0x2183, 0x1D],
    [0x2EDA, 0x1E],
    [0x2BED, 0x1F]
  ];

  /**
   * Offset i holds the number of 1 bits in the binary representation of i
   */
  FormatInformation.BITS_SET_IN_HALF_BYTE = [0, 1, 1, 2, 1, 2, 2, 3,
    1, 2, 2, 3, 2, 3, 3, 4];

  pro.GetHashCode = function() {
    return (this.errorCorrectionLevel.ordinal << 3) | this.dataMask;
  };

  pro.Equals = function(other) {
    return this.errorCorrectionLevel == other.errorCorrectionLevel &&
      this.dataMask == other.dataMask;
  };

  FormatInformation.numBitsDiffering = function(a, b) {
    a ^= b; // a now has a 1 bit exactly where its bit differs with b's
    // Count bits set quickly with a series of lookups:
    return FormatInformation.BITS_SET_IN_HALF_BYTE[a & 0x0F] +
      FormatInformation.BITS_SET_IN_HALF_BYTE[(URShift(a, 4) & 0x0F)] +
      FormatInformation.BITS_SET_IN_HALF_BYTE[(URShift(a, 8) & 0x0F)] +
      FormatInformation.BITS_SET_IN_HALF_BYTE[(URShift(a, 12) & 0x0F)] +
      FormatInformation.BITS_SET_IN_HALF_BYTE[(URShift(a, 16) & 0x0F)] +
      FormatInformation.BITS_SET_IN_HALF_BYTE[(URShift(a, 20) & 0x0F)] +
      FormatInformation.BITS_SET_IN_HALF_BYTE[(URShift(a, 24) & 0x0F)] +
      FormatInformation.BITS_SET_IN_HALF_BYTE[(URShift(a, 28) & 0x0F)];
  };

  FormatInformation.decodeFormatInformation = function(maskedFormatInfo) {
    var formatInfo = FormatInformation.doDecodeFormatInformation(
      maskedFormatInfo);
    if (formatInfo != null) {
      return formatInfo;
    }
    // Should return null, but, some QR codes apparently
    // do not mask this info. Try again by actually masking the pattern
    // first
    return FormatInformation.doDecodeFormatInformation(maskedFormatInfo ^
      FormatInformation.FORMAT_INFO_MASK_QR);
  };

  FormatInformation.doDecodeFormatInformation = function(maskedFormatInfo) {
    // Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
    var bestDifference = 0xffffffff;
    var bestFormatInfo = 0;
    for (var i = 0; i < FormatInformation.FORMAT_INFO_DECODE_LOOKUP.length;
         i++) {
      var decodeInfo = FormatInformation.FORMAT_INFO_DECODE_LOOKUP[i];
      var targetInfo = decodeInfo[0];
      if (targetInfo == maskedFormatInfo) {
        // Found an exact match
        return new FormatInformation(decodeInfo[1]);
      }
      var bitsDifference = FormatInformation.numBitsDiffering(
        maskedFormatInfo, targetInfo);
      if (bitsDifference < bestDifference) {
        bestFormatInfo = decodeInfo[1];
        bestDifference = bitsDifference;
      }
    }
    // Hamming distance of the 32 masked codes is 7, by construction,
    // so <= 3 bits differing means we found a match
    if (bestDifference <= 3) {
      return new FormatInformation(bestFormatInfo);
    }
    return null;
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.DataMask');
goog.require('w69b.qr.URShift');

goog.scope(function() {
  var URShift = w69b.qr.URShift;

  var _ = w69b.qr.DataMask;

  /** @interface */
  _.DataMaskInterface = function() {};

  /**
   * @param {w69b.qr.BitMatrix} bits bits.
   * @param {number} dim dimensions.
   */
  _.DataMaskInterface.prototype.unmaskBitMatrix = function(bits, dim) {};

  /**
   * @param {number} i idx.
   * @param {number} j idx.
   * @return {boolean} if position is masked.
   */
  _.DataMaskInterface.prototype.isMasked = function(i, j) {};


  /**
   * @param {number} reference mask number.
   * @return {!_.DataMaskInterface} data mask.
   */
  _.forReference = function(reference) {
    if (reference < 0 || reference > 7) {
      throw Error();
    }
    return _.DATA_MASKS_[reference];
  };

  /**
   * @constructor
   */
  _.DataMask000 = function() {
  };
  _.DataMask000.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask000.prototype.isMasked = function(i, j) {
    return ((i + j) & 0x01) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask001 = function() {
  };
  _.DataMask001.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask001.prototype.isMasked = function(i, j) {
    return (i & 0x01) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask010 = function() {
  };
  _.DataMask010.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask010.prototype.isMasked = function(i, j) {
    return j % 3 == 0;
  };

  /**
   * @constructor
   */
  _.DataMask011 = function() {

  };
  _.DataMask011.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask011.prototype.isMasked = function(i, j) {
    return (i + j) % 3 == 0;
  };


  /**
   * @constructor
   */
  _.DataMask100 = function() {
  };
  _.DataMask100.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask100.prototype.isMasked = function(i, j) {
    return (((URShift(i, 1)) + (j / 3)) & 0x01) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask101 = function() {
  };

  _.DataMask101.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };

  _.DataMask101.prototype.isMasked = function(i, j) {
    var temp = i * j;
    return (temp & 0x01) + (temp % 3) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask110 = function() {
  };
  _.DataMask110.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask110.prototype.isMasked = function(i, j) {
    var temp = i * j;
    return (((temp & 0x01) + (temp % 3)) & 0x01) == 0;
  };

  /**
   * @constructor
   */
  _.DataMask111 = function() {
  };
  _.DataMask111.prototype.unmaskBitMatrix = function(bits, dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  _.DataMask111.prototype.isMasked = function(i, j) {
    return ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) == 0;
  };

  /**
   * @type {Array.<!_.DataMaskInterface>}
   * @private
   */
  _.DATA_MASKS_ = new Array(new _.DataMask000(), new _.DataMask001(),
    new _.DataMask010(), new _.DataMask011(), new _.DataMask100(),
    new _.DataMask101(),
    new _.DataMask110(), new _.DataMask111());

});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.BitMatrixParser');
goog.require('w69b.qr.DataMask');
goog.require('w69b.qr.FormatError');
goog.require('w69b.qr.FormatInformation');
goog.require('w69b.qr.Version');

goog.scope(function() {
  var FormatInformation = w69b.qr.FormatInformation;
  var Version = w69b.qr.Version;
  var DataMask = w69b.qr.DataMask;
  var FormatError = w69b.qr.FormatError;

  /**
   * @param {w69b.qr.BitMatrix} bitMatrix matrix.
   * @constructor
   */
  w69b.qr.BitMatrixParser = function(bitMatrix) {
    var dimension = bitMatrix.getHeight();
    if (dimension < 21 || (dimension & 0x03) != 1) {
      throw new FormatError();
    }
    this.bitMatrix = bitMatrix;
    /**
     * @type {w69b.qr.Version}
     */
    this.parsedVersion = null;
    /**
     * @type {w69b.qr.FormatInformation}
     */
    this.parsedFormatInfo = null;
  };
  var BitMatrixParser = w69b.qr.BitMatrixParser;
  var pro = BitMatrixParser.prototype;

  pro.copyBit = function(i, j, versionBits) {
    return this.bitMatrix.get(i,
      j) ? (versionBits << 1) | 0x1 : versionBits << 1;
  };

  /**
   * @return {!w69b.qr.FormatInformation} format information.
   */
  pro.readFormatInformation = function() {
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }

    // Read top-left format info bits
    var formatInfoBits = 0;
    for (var i = 0; i < 6; i++) {
      formatInfoBits = this.copyBit(i, 8, formatInfoBits);
    }
    // .. and skip a bit in the timing pattern ...
    formatInfoBits = this.copyBit(7, 8, formatInfoBits);
    formatInfoBits = this.copyBit(8, 8, formatInfoBits);
    formatInfoBits = this.copyBit(8, 7, formatInfoBits);
    // .. and skip a bit in the timing pattern ...
    for (var j = 5; j >= 0; j--) {
      formatInfoBits = this.copyBit(8, j, formatInfoBits);
    }

    this.parsedFormatInfo =
      FormatInformation.decodeFormatInformation(formatInfoBits);
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }

    // Hmm, failed. Try the top-right/bottom-left pattern
    var dimension = this.bitMatrix.getHeight();
    formatInfoBits = 0;
    var iMin = dimension - 8;
    for (var i = dimension - 1; i >= iMin; i--) {
      formatInfoBits = this.copyBit(i, 8, formatInfoBits);
    }
    for (var j = dimension - 7; j < dimension; j++) {
      formatInfoBits = this.copyBit(8, j, formatInfoBits);
    }

    this.parsedFormatInfo =
      FormatInformation.decodeFormatInformation(formatInfoBits);
    if (this.parsedFormatInfo != null) {
      return this.parsedFormatInfo;
    }
    throw new FormatError();
  };

  /**
   * @return {w69b.qr.Version} version.
   */
  pro.readVersion = function() {
    if (this.parsedVersion != null) {
      return this.parsedVersion;
    }

    var dimension = this.bitMatrix.getHeight();

    var provisionalVersion = (dimension - 17) >> 2;
    if (provisionalVersion <= 6) {
      return Version.getVersionForNumber(provisionalVersion);
    }

    // Read top-right version info: 3 wide by 6 tall
    var versionBits = 0;
    var ijMin = dimension - 11;
    for (var j = 5; j >= 0; j--) {
      for (var i = dimension - 9; i >= ijMin; i--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    this.parsedVersion = Version.decodeVersionInformation(versionBits);
    if (this.parsedVersion != null &&
      this.parsedVersion.getDimensionForVersion() == dimension) {
      return this.parsedVersion;
    }

    // Hmm, failed. Try bottom left: 6 wide by 3 tall
    versionBits = 0;
    for (var i = 5; i >= 0; i--) {
      for (var j = dimension - 9; j >= ijMin; j--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }

    this.parsedVersion = Version.decodeVersionInformation(versionBits);
    if (this.parsedVersion != null &&
      this.parsedVersion.getDimensionForVersion() == dimension) {
      return this.parsedVersion;
    }
    throw new FormatError();
  };

  pro.readCodewords = function() {

    var formatInfo = this.readFormatInformation();
    var version = this.readVersion();

    // Get the data mask for the format used in this QR Code. This will exclude
    // some bits from reading as we wind through the bit matrix.
    var dataMask = DataMask.forReference(formatInfo.dataMask);
    var dimension = this.bitMatrix.getHeight();
    dataMask.unmaskBitMatrix(this.bitMatrix, dimension);

    var functionPattern = version.buildFunctionPattern();

    var readingUp = true;
    var result = new Array(version.totalCodewords);
    var resultOffset = 0;
    var currentByte = 0;
    var bitsRead = 0;
    // Read columns in pairs, from right to left
    for (var j = dimension - 1; j > 0; j -= 2) {
      if (j == 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }
      // Read alternatingly from bottom to top then top to bottom
      for (var count = 0; count < dimension; count++) {
        var i = readingUp ? dimension - 1 - count : count;
        for (var col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!functionPattern.get(j - col, i)) {
            // Read a bit
            bitsRead++;
            currentByte <<= 1;
            if (this.bitMatrix.get(j - col, i)) {
              currentByte |= 1;
            }
            // If we've made a whole byte, save it off
            if (bitsRead == 8) {
              result[resultOffset++] = currentByte;
              bitsRead = 0;
              currentByte = 0;
            }
          }
        }
      }
      readingUp ^= true; // readingUp = !readingUp; // switch directions
    }
    if (resultOffset != version.totalCodewords) {
      throw new FormatError();
    }
    return result;
  };
});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.DataBlock');

goog.scope(function() {

  /**
   * @constructor
   */
  w69b.qr.DataBlock = function(numDataCodewords, codewords) {
    this.numDataCodewords = numDataCodewords;
    this.codewords = codewords;
  };
  var DataBlock = w69b.qr.DataBlock;

  DataBlock.getDataBlocks = function(rawCodewords, version, ecLevel) {

    if (rawCodewords.length != version.totalCodewords) {
      throw 'ArgumentException';
    }

    // Figure out the number and size of data blocks used by this version and
    // error correction level
    var ecBlocks = version.getECBlocksForLevel(ecLevel);

    // First count the total number of data blocks
    var totalBlocks = 0;
    var ecBlockArray = ecBlocks.getECBlocks();
    for (var i = 0; i < ecBlockArray.length; i++) {
      totalBlocks += ecBlockArray[i].count;
    }

    // Now establish DataBlocks of the appropriate size and number of data
    // codewords
    var result = new Array(totalBlocks);
    var numResultBlocks = 0;
    for (var j = 0; j < ecBlockArray.length; j++) {
      var ecBlock = ecBlockArray[j];
      for (var i = 0; i < ecBlock.count; i++) {
        var numDataCodewords = ecBlock.dataCodewords;
        var numBlockCodewords = ecBlocks.ecCodewordsPerBlock + numDataCodewords;
        result[numResultBlocks++] = new DataBlock(numDataCodewords,
          new Array(numBlockCodewords));
      }
    }

    // All blocks have the same amount of data, except that the last n
    // (where n may be 0) have 1 more byte. Figure out where these start.
    var shorterBlocksTotalCodewords = result[0].codewords.length;
    var longerBlocksStartAt = result.length - 1;
    while (longerBlocksStartAt >= 0) {
      var numCodewords = result[longerBlocksStartAt].codewords.length;
      if (numCodewords == shorterBlocksTotalCodewords) {
        break;
      }
      longerBlocksStartAt--;
    }
    longerBlocksStartAt++;

    var shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords -
      ecBlocks.ecCodewordsPerBlock;
    // The last elements of result may be 1 element longer;
    // first fill out as many elements as all of them have
    var rawCodewordsOffset = 0;
    for (var i = 0; i < shorterBlocksNumDataCodewords; i++) {
      for (var j = 0; j < numResultBlocks; j++) {
        result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
      }
    }
    // Fill out the last data block in the longer ones
    for (var j = longerBlocksStartAt; j < numResultBlocks; j++) {
      result[j].codewords[shorterBlocksNumDataCodewords] =
        rawCodewords[rawCodewordsOffset++];
    }
    // Now add in error correction blocks
    var max = result[0].codewords.length;
    for (var i = shorterBlocksNumDataCodewords; i < max; i++) {
      for (var j = 0; j < numResultBlocks; j++) {
        var iOffset = j < longerBlocksStartAt ? i : i + 1;
        result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
      }
    }
    return result;
  };

});


// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utility for fast string concatenation.
 */

goog.provide('goog.string.StringBuffer');



/**
 * Utility class to facilitate string concatenation.
 *
 * @param {*=} opt_a1 Optional first initial item to append.
 * @param {...*} var_args Other initial items to
 *     append, e.g., new goog.string.StringBuffer('foo', 'bar').
 * @constructor
 */
goog.string.StringBuffer = function(opt_a1, var_args) {
  if (opt_a1 != null) {
    this.append.apply(this, arguments);
  }
};


/**
 * Internal buffer for the string to be concatenated.
 * @type {string}
 * @private
 */
goog.string.StringBuffer.prototype.buffer_ = '';


/**
 * Sets the contents of the string buffer object, replacing what's currently
 * there.
 *
 * @param {*} s String to set.
 */
goog.string.StringBuffer.prototype.set = function(s) {
  this.buffer_ = '' + s;
};


/**
 * Appends one or more items to the buffer.
 *
 * Calling this with null, undefined, or empty arguments is an error.
 *
 * @param {*} a1 Required first string.
 * @param {*=} opt_a2 Optional second string.
 * @param {...*} var_args Other items to append,
 *     e.g., sb.append('foo', 'bar', 'baz').
 * @return {!goog.string.StringBuffer} This same StringBuffer object.
 * @suppress {duplicate}
 */
goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
  // Use a1 directly to avoid arguments instantiation for single-arg case.
  this.buffer_ += a1;
  if (opt_a2 != null) { // second argument is undefined (null == undefined)
    for (var i = 1; i < arguments.length; i++) {
      this.buffer_ += arguments[i];
    }
  }
  return this;
};


/**
 * Clears the internal buffer.
 */
goog.string.StringBuffer.prototype.clear = function() {
  this.buffer_ = '';
};


/**
 * @return {number} the length of the current contents of the buffer.
 */
goog.string.StringBuffer.prototype.getLength = function() {
  return this.buffer_.length;
};


/**
 * @return {string} The concatenated string.
 * @override
 */
goog.string.StringBuffer.prototype.toString = function() {
  return this.buffer_;
};

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Ported to js by Manuel Braun
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.BitSource');

goog.scope(function() {
  /** <p>This provides an easy abstraction to read bits at a time from a
   * sequence of bytes, where the number of bits read is not often a multiple
   * of 8.</p>
   *
   * <p>This class is thread-safe but not reentrant -- unless the caller
   * modifies the bytes array it passed in, in which case all bets are off.</p>
   *
   * @param {Array.<number>} bytes bytes bytes from which this will read bits.
   * Bits will be read from the first byte first.  Bits are read within a byte
   * from most-significant to least-significant bit.  @constructor
   * @constructor
   */
  w69b.qr.BitSource = function(bytes) {
    this.bytes_ = bytes;
    this.byteOffset_ = 0;
    this.bitOffset_ = 0;
  };
  var BitSource = w69b.qr.BitSource;
  var pro = BitSource.prototype;

  /**
   * @return {number} index of next bit in current byte which would be read by
   * the next call to readBits().
   */
  pro.getBitOffset = function() {
    return this.bitOffset_;
  };

  /**
  * @return {number} index of next byte in input byte array which would be read
  * by the next call to readBits().
   */
  pro.getByteOffset = function() {
    return this.byteOffset_;
  };

  /**
   * @param {number} numBits number of bits to read.  @return {number} int
   * representing the bits read. The bits will appear as the least-significant
   * bits of the int.
   */
  pro.readBits = function(numBits) {
    if (numBits < 1 || numBits > 32 || numBits > this.available()) {
      throw new Error();
    }

    var result = 0;

    // First, read remainder from current byte
    if (this.bitOffset_ > 0) {
      var bitsLeft = 8 - this.bitOffset_;
      var toRead = numBits < bitsLeft ? numBits : bitsLeft;
      var bitsToNotRead = bitsLeft - toRead;
      var mask = (0xFF >> (8 - toRead)) << bitsToNotRead;
      result = (this.bytes_[this.byteOffset_] & mask) >> bitsToNotRead;
      numBits -= toRead;
      this.bitOffset_ += toRead;
      if (this.bitOffset_ == 8) {
        this.bitOffset_ = 0;
        this.byteOffset_++;
      }
    }

    // Next read whole bytes
    if (numBits > 0) {
      while (numBits >= 8) {
        result = (result << 8) | (this.bytes_[this.byteOffset_] & 0xFF);
        this.byteOffset_++;
        numBits -= 8;
      }

      // Finally read a partial byte
      if (numBits > 0) {
        var bitsToNotRead = 8 - numBits;
        var mask = (0xFF >> bitsToNotRead) << bitsToNotRead;
        result = (result << numBits) |
          ((this.bytes_[this.byteOffset_] & mask) >> bitsToNotRead);
        this.bitOffset_ += numBits;
      }
    }
    return result;
  };

  /**
   * @return {number} number of bits that can be read successfully.
   */
  pro.available = function() {
    return 8 * (this.bytes_.length - this.byteOffset_) - this.bitOffset_;
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.CharacterSetECI');
goog.require('goog.object');

goog.scope(function() {

  var _ = w69b.qr.CharacterSetECI;
  /**
   * @type {Object} mapping eci codes to arrays of encoding names.
   */
  _.valuesToNames = {
    0: ['CP437'],
    2: ['CP437'],
    1: ['ISO-8859-1'],
    3: ['ISO-8859-1'],
    4: ['ISO-8859-2'],
    5: ['ISO-8859-3'],
    6: ['ISO-8859-4'],
    7: ['ISO-8859-5'],
    8: ['ISO-8859-6'],
    9: ['ISO-8859-7'],
    10: ['ISO-8859-7'],
    11: ['ISO-8859-9'],
    12: ['ISO-8859-10'],
    13: ['ISO-8859-11'],
    14: ['ISO-8859-12'],
    15: ['ISO-8859-13'],
    16: ['ISO-8859-14'],
    17: ['ISO-8859-15'],
    18: ['ISO-8859-16'],
    20: ['SHIFT_JIS'],
    21: ['ISO-8859-16'],
    22: ['Cp1251', 'windows-1251'],
    23: ['Cp1252', 'windows-1252'],
    24: ['Cp1256', 'windows-1256'],
    25: ['UTF-16BE', 'UnicodeBig'],
    26: ['UTF-8'],
    27: ['ASCII', 'US-ASCII'],
    170: ['ASCII', 'US-ASCII'],
    28: ['Big5'],
    29: ['GB18030', 'GB2312', 'EUC_CN', 'GBK'],
    30: ['EUC-KR']
  };
  _.namesToValues = {};
  /**
   * @private
   */
  _.buildNamesToValues_ = function() {
    goog.object.forEach(_.valuesToNames, function(names, num) {
      names.forEach(function(name) {
        if (!_.namesToValues[name])
          _.namesToValues[name] = num;
      });
    });
  };
  _.buildNamesToValues_();

  /**
   * @param {string} name of encoding.
   * @return {?number} eci value.
   */
  _.getValue = function(name) {
    return Number(_.namesToValues[name]);
  };

  /**
   * @param {number} value eci value.
   * @return {?string} main encoding name.
   */
  _.getName = function(value) {
    var names = _.valuesToNames[value];
    if (names)
      return names[0];
    else
      return null;
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.Mode');
goog.provide('w69b.qr.ModeEnum');

goog.scope(function() {
  /**
   * <p>See ISO 18004:2006, 6.4.1, Tables 2 and 3. This enum encapsulates the
   * various modes in which data can be encoded to bits in the QR code
   * standard.</p>
   *
   * @author Sean Owen
   */
  /**
   *
   * @param {Array.<number>} characterCountBitsForVersions nodoc.
   * @param {number} bits nodoc.
   * @param {string=} opt_name name for testing.
   * @constructor
   */
  w69b.qr.Mode = function(characterCountBitsForVersions, bits, opt_name) {
    this.characterCountBitsForVersions = characterCountBitsForVersions;
    this.bits = bits;
    this.name_ = opt_name || 'NONAME';
  };
  var Mode = w69b.qr.Mode;
  var pro = Mode.prototype;


  /** @enum {Mode} */

  w69b.qr.ModeEnum = {
    // Not really a mode...
    TERMINATOR: new Mode([0, 0, 0], 0x00, 'TERMINATOR'),
    NUMERIC: new Mode([10, 12, 14], 0x01, 'NUMERIC'),
    ALPHANUMERIC: new Mode([9, 11, 13], 0x02, 'ALPHANUMERIC'),
    // Not supported
    STRUCTURED_APPEND: new Mode([0, 0, 0], 0x03, 'STRUCTURED_APPEND'),
    BYTE: new Mode([8, 16, 16], 0x04, 'BYTE'),
    ECI: new Mode([0, 0, 0], 0x07, 'ECI'), // character counts don't apply
    KANJI: new Mode([8, 10, 12], 0x08, 'KANJI'),
    FNC1_FIRST_POSITION: new Mode([0, 0, 0], 0x05, 'FNC1_FIRST_POSITION'),
    FNC1_SECOND_POSITION: new Mode([0, 0, 0], 0x09, 'FNC1_SECOND_POSITION'),
    /** See GBT 18284-2000; "Hanzi" is a transliteration of this mode name. */
    HANZI: new Mode([8, 10, 12], 0x0D, 'HANZI')
  };
  var ModeEnum = w69b.qr.ModeEnum;


  /**
   * @param {w69b.qr.Version} version version in question.
   * @return {number} number of bits used, in this QR Code symbol {@link Version} , to
   * encode the count of characters that will follow encoded in this Mode.
   */
  pro.getCharacterCountBits = function(version) {
    var number = version.versionNumber;
    var offset;
    if (number <= 9) {
      offset = 0;
    } else if (number <= 26) {
      offset = 1;
    } else {
      offset = 2;
    }
    return this.characterCountBitsForVersions[offset];
  };

  pro.getBits = function() {
    return this.bits;
  };

  /**
   * @return {string} debug string.
   */
  pro.toString = function() {
    return this.name_;
  };


  /**
   * @param {number} bits four bits encoding a QR Code data mode.
   * @return {Mode} Mode encoded by these bits.
   */
  Mode.forBits = function(bits) {
    switch (bits) {
      case 0x0:
        return ModeEnum.TERMINATOR;
      case 0x1:
        return ModeEnum.NUMERIC;
      case 0x2:
        return ModeEnum.ALPHANUMERIC;
      case 0x3:
        return ModeEnum.STRUCTURED_APPEND;
      case 0x4:
        return ModeEnum.BYTE;
      case 0x5:
        return ModeEnum.FNC1_FIRST_POSITION;
      case 0x7:
        return ModeEnum.ECI;
      case 0x8:
        return ModeEnum.KANJI;
      case 0x9:
        return ModeEnum.FNC1_SECOND_POSITION;
      case 0xD:
        // 0xD is defined in GBT 18284-2000, may not be supported in foreign
        // country
        return ModeEnum.HANZI;
      default:
        throw new Error();
    }
  };
});


goog.provide('w69b.utf8');
/**
 * @license
 * utf8.js
 * License: Apache2, v2 see http://www.apache.org/licenses/LICENSE-2.0
 * @author mb@w69b.com (Manuel Braun)
 */
(function(global) {
  /**
   * @license
   * Snippet fixedCharCodeAt borrowed from http://goo.gl/3lRpR.
   * (c) see contributers of site.
   * License: MIT
  */
  function fixedCharCodeAt(str, idx) {
      var code = str.charCodeAt(idx);
      var hi, low;
      // High surrogate (could change last hex to 0xDB7F to treat high private
      // surrogates as single characters)
      if (0xD800 <= code && code <= 0xDBFF) {
          hi = code;
          low = str.charCodeAt(idx + 1);
          if (isNaN(low)) {
            throw 'fixedCharCodeAt: Invalid Encoding';
          }
          return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      }
      // We return false to allow loops to skip this iteration since should
      // have already handled high surrogate above in the previous iteration
      // Low surrogate
      if (0xDC00 <= code && code <= 0xDFFF) {
          return false;
      }
      return code;
  }

  /**
   * @license
   * fixedFromCodePoint
  * Convert array of unicode code points to string.
  * Originally from:
  * ES6 Unicode Shims 0.1
  * (c) 2012 Steven Levithan <http://slevithan.com/>
  * MIT License
  * @param {Array.<number>} codePoints codePoints sequence.
  * @return {string} resulting string.
  */
  function fixedFromCodePoint(codePoints) {
    var chars = [], point, offset, units, i;
    for (i = 0; i < codePoints.length; ++i) {
      point = codePoints[i];
      offset = point - 0x10000;
      units = point > 0xFFFF ?
        [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)] : [point];
      chars.push(String.fromCharCode.apply(null, units));
    }
    return chars.join('');
  }

  /**
   * Convert string to UTF8 byte sequence.
   * @param {string} str javascript string (unicode).
   * @return {Array.<number>} byte sequence.
   */
  function stringToUTF8Bytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
      var codePoint = fixedCharCodeAt(str, i);
      // already handeled
      if (!codePoint) continue;
      if (codePoint <= 0x7F) {
        bytes.push(codePoint);
      } else if (codePoint <= 0x07FF) {
        bytes.push(0xC0 | (codePoint >> 6));
        bytes.push(0x80 | (codePoint & 0x3F));
      } else if (codePoint <= 0xFFFF) {
        bytes.push(0xE0 | (codePoint >> 12));
        bytes.push(0x80 | (0x3F & (codePoint >> 6)));
        bytes.push(0x80 | (codePoint & 0x3F));
      } else if (codePoint <= 0x1FFFFF) {
        bytes.push(0xF0 | (codePoint >> 18));
        bytes.push(0x80 | (0x3F & (codePoint >> 12)));
        bytes.push(0x80 | (0x3F & (codePoint >> 6)));
        bytes.push(0x80 | (codePoint & 0x3F));
      } else if (codePoint <= 0x3FFFFFF) {
        bytes.push(0xF0 | (codePoint >> 24));
        bytes.push(0x80 | (0x3F & (codePoint >> 18)));
        bytes.push(0x80 | (0x3F & (codePoint >> 12)));
        bytes.push(0x80 | (0x3F & (codePoint >> 6)));
        bytes.push(0x80 | (codePoint & 0x3F));
      } else {
        bytes.push(0xF0 | (0x01 & (codePoint >> 30)));
        bytes.push(0x80 | (0x3F & (codePoint >> 24)));
        bytes.push(0x80 | (0x3F & (codePoint >> 18)));
        bytes.push(0x80 | (0x3F & (codePoint >> 12)));
        bytes.push(0x80 | (0x3F & (codePoint >> 6)));
        bytes.push(0x80 | (codePoint & 0x3F));
      }
    }
    return bytes;
  }

  /**
   * Convert UTF8 byte sequence to string.
   * @param {Array.<number>} bytes UTF8 byte sequence.
   * @return {?string} result string or null on error (invalid input).
   */
  function UTF8BytesToString(bytes) {
    var length = bytes.length;
    var getContinuation = function(idx) {
      if (idx > length) throw new Error();
      var b = bytes[idx];
      if ((b & 0xC0) !== 0x80) throw new Error();
      return b & 0x3F;
    };
    var codePoints = [];
    try {
      for (var i = 0; i < length; ++i) {
        var b = bytes[i];
        if (b > 0xFF) return null;
        var code;
        if ((b & 0x80) === 0x00) {
          // First bit not set, so it is a 1-byte char.
          code = b;
        } else if ((b & 0xE0) === 0xC0) {
          // 2 bytes.
          code = ((0x1F & b) << 6) | getContinuation(i + 1);
          i += 1;
        } else if ((b & 0xF0) === 0xE0) {
          // 3 bytes.
          code = ((0x0F & b) << 12) |
            (getContinuation(i + 1) << 6) |
            getContinuation(i + 2);
          i += 2;
        } else if ((b & 0xF8) === 0xF0) {
          // 4 bytes.
          code = ((0x07 & b) << 18) |
            (getContinuation(i + 1) << 12) |
            (getContinuation(i + 2) << 6) |
            getContinuation(i + 3);
          i += 3;
        } else if ((b & 0xFC) === 0xF8) {
          // 5 bytes.
          code = ((0x03 & b) << 24) |
            (getContinuation(i + 1) << 18) |
            (getContinuation(i + 2) << 12) |
            (getContinuation(i + 3) << 6) |
            getContinuation(i + 4);
          i += 4;
        } else if ((b & 0xFE) === 0xFC) {
          // 6 bytes.
          code = ((0x01 & b) << 30) |
            (getContinuation(i + 1) << 24) |
            (getContinuation(i + 2) << 18) |
            (getContinuation(i + 3) << 12) |
            (getContinuation(i + 4) << 6) |
            getContinuation(i + 5);
          i += 5;
        }
        codePoints.push(code);
      }
    } catch (ignored) {
      // Our invalid-incoding exception is the only one thrown
      // this block, so just return null.
      return null;
    }
    return fixedFromCodePoint(codePoints);
  }

  // Public API.
  var exports = {
    stringToUTF8Bytes: stringToUTF8Bytes,
    UTF8BytesToString: UTF8BytesToString
  };

  if (typeof(goog) == 'object' && goog.provide) {
    // Google Closure Tools compatibility hook.
    w69b.utf8.stringToUTF8Bytes = stringToUTF8Bytes;
    w69b.utf8.UTF8BytesToString = UTF8BytesToString;
  } else if (typeof(global.define) == 'function') {
    // require js compatibility hook.
    global.define(exports);
  } else {
    // Plain old global export fallback.
    global['utf8'] = exports;
  }
})(self);

/*
 @license
 Singlebyte encodings values ported from iconv-lite (for nodejs).
 google closure/browser port 2013 by Manuel Braun (mb@w69b.com)

 LICENSE of iconve-lite:

 Copyright (c) 2011 Alexander Shtuchkin

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

goog.provide('w69b.iconvlite');
goog.require('w69b.utf8');
goog.require('goog.object');


goog.scope(function() {
  var _ = w69b.iconvlite;
  _.SINGLEBYTES = {
    'Cp1251': 'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ\xa0ЎўЈ¤Ґ¦§Ё©Є«¬­®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя',
    'Cp1252': '€�‚ƒ„…†‡ˆ‰Š‹Œ�Ž��‘’“”•–—˜™š›œ�žŸ\xa0¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ',
    'Cp1256': '€پ‚ƒ„…†‡ˆ‰ٹ‹Œچژڈگ‘’“”•–—ک™ڑ›œ‌‍ں\xa0،¢£¤¥¦§¨©ھ«¬­®¯°±²³´µ¶·¸¹؛»¼½¾؟ہءآأؤإئابةتثجحخدذرزسشصض×طظعغـفقكàلâمنهوçèéêëىيîïًٌٍَôُِ÷ّùْûü‎‏ے',
    'ISO-8859-1': '\xa0¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ',
    'ISO-8859-2': '\xa0Ą˘Ł¤ĽŚ§¨ŠŞŤŹ­ŽŻ°ą˛ł´ľśˇ¸šşťź˝žżŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢßŕáâăäĺćçčéęëěíîďđńňóôőö÷řůúűüýţ˙',
    'ISO-8859-3': '\xa0Ħ˘£¤�Ĥ§¨İŞĞĴ­�Ż°ħ²³´µĥ·¸ışğĵ½�żÀÁÂ�ÄĊĈÇÈÉÊËÌÍÎÏ�ÑÒÓÔĠÖ×ĜÙÚÛÜŬŜßàáâ�äċĉçèéêëìíîï�ñòóôġö÷ĝùúûüŭŝ˙',
    'ISO-8859-4': '\xa0ĄĸŖ¤ĨĻ§¨ŠĒĢŦ­Ž¯°ą˛ŗ´ĩļˇ¸šēģŧŊžŋĀÁÂÃÄÅÆĮČÉĘËĖÍÎĪĐŅŌĶÔÕÖ×ØŲÚÛÜŨŪßāáâãäåæįčéęëėíîīđņōķôõö÷øųúûüũū˙',
    'ISO-8859-5': '\xa0ЁЂЃЄЅІЇЈЉЊЋЌ­ЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя№ёђѓєѕіїјљњћќ§ўџ',
    'ISO-8859-6': '\xa0���¤�������،­�������������؛���؟�ءآأؤإئابةتثجحخدذرزسشصضطظعغ�����ـفقكلمنهوىيًٌٍَُِّْ�������������',
    'ISO-8859-7': '\xa0‘’£€₯¦§¨©ͺ«¬­�―°±²³΄΅Ά·ΈΉΊ»Ό½ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ�ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ�',
    'ISO-8859-8': '\xa0�¢£¤¥¦§¨©×«¬­®¯°±²³´µ¶·¸¹÷»¼½¾��������������������������������‗אבגדהוזחטיךכלםמןנסעףפץצקרשת��‎‏�',
    'ISO-8859-9': '\xa0¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõö÷øùúûüışÿ',
    'ISO-8859-10': '\xa0ĄĒĢĪĨĶ§ĻĐŠŦŽ­ŪŊ°ąēģīĩķ·ļđšŧž―ūŋĀÁÂÃÄÅÆĮČÉĘËĖÍÎÏÐŅŌÓÔÕÖŨØŲÚÛÜÝÞßāáâãäåæįčéęëėíîïðņōóôõöũøųúûüýþĸ',
    'ISO-8859-11': '\xa0กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����',
    'ISO-8859-13': '\xa0”¢£¤„¦§Ø©Ŗ«¬­®Æ°±²³“µ¶·ø¹ŗ»¼½¾æĄĮĀĆÄÅĘĒČÉŹĖĢĶĪĻŠŃŅÓŌÕÖ×ŲŁŚŪÜŻŽßąįāćäåęēčéźėģķīļšńņóōõö÷ųłśūüżž’',
    'ISO-8859-14': '\xa0Ḃḃ£ĊċḊ§Ẁ©ẂḋỲ­®ŸḞḟĠġṀṁ¶ṖẁṗẃṠỳẄẅṡÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏŴÑÒÓÔÕÖṪØÙÚÛÜÝŶßàáâãäåæçèéêëìíîïŵñòóôõöṫøùúûüýŷÿ',
    'ISO-8859-15': '\xa0¡¢£€¥Š§š©ª«¬­®¯°±²³Žµ¶·ž¹º»ŒœŸ¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ',
    'ISO-8859-16': '\xa0ĄąŁ€„Š§š©Ș«Ź­źŻ°±ČłŽ”¶·žčș»ŒœŸżÀÁÂĂÄĆÆÇÈÉÊËÌÍÎÏĐŃÒÓÔŐÖŚŰÙÚÛÜĘȚßàáâăäćæçèéêëìíîïđńòóôőöśűùúûüęțÿ'
  };
  _.ASCII = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f' +
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f';

  _.REVERSE_MAPS_ = {};

  /**
   * @param {Array.<number>} bytes sequence of given charset.
   * @param {string} charset name of charset.
   * @return {string} decoded string.
   */
  _.toString = function(bytes, charset) {
    var chars = _.ASCII + _.SINGLEBYTES[charset];
    if (!chars) throw new Error();
    return bytes.map(function(b) {
      return chars[b];
    }).join('');
  };

  /**
   * @param {string} charset name as specified above.
   * @return {boolean} if charset is supported.
   */
  _.isSupported = function(charset) {
    return !!_.SINGLEBYTES[charset];
  };

  /**
   *
   * @param {string} string encoded in charset.
   * @param {string} charset charset name
   * @return {Array.<number>} bytes.
   */
  _.toBytes = function(string, charset) {
    var map = _.getReverseMap_(charset);
    var bytes = [];
    for (var i = 0; i < string.length; ++i) {
      var b = map[string[i]];
      if (b === undefined) return null;
      bytes.push(b);
    }
    return bytes;
  };

  /**
   * @param {string} charset name.
   * @return {Object} reverse map (mapping str to bytes).
   * @private
   */
  _.getReverseMap_ = function(charset) {
    var map = _.REVERSE_MAPS_[charset];
    if (!map) {
      map = {};
      var chars = _.ASCII + _.SINGLEBYTES[charset];
      if (!chars)
        throw new Error();
      for (var i = 0; i < chars.length; ++i) {
        map[chars[i]] = i;
      }
    }
    _.REVERSE_MAPS_[charset] = map;
    return map;
  };

  /**
   * @return {Array.<string>} supported charsets.
   */
  _.getSupportedCharsets = function() {
    return goog.object.getKeys(_.SINGLEBYTES);
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.stringutils');
goog.require('w69b.iconvlite');
goog.require('w69b.qr.DecodeHintType');
goog.require('w69b.qr.InvalidCharsetError');
goog.require('w69b.utf8');

goog.scope(function() {
  var _ = w69b.qr.stringutils;
  var utf8 = w69b.utf8;
  var iconv = self.iconv;
  var iconvlite = w69b.iconvlite;
  var InvalidCharsetError = w69b.qr.InvalidCharsetError;

  _.SHIFT_JIS = 'SHIFT_JIS';
  _.GB2312 = 'GB18030';
  _.EUC_JP = 'EUC-JP';
  _.UTF8 = 'UTF-8';
  _.ISO88591 = 'ISO-8859-1';
  _.PLATFORM_DEFAULT_ENCODING = _.UTF8;
  _.ASSUME_SHIFT_JIS = false;
  // SHIFT_JIS.equalsIgnoreCase(PLATFORM_DEFAULT_ENCODING) ||
  // EUC_JP.equalsIgnoreCase(PLATFORM_DEFAULT_ENCODING);


  /**
   * Decodes bytes bytes array as returned by getBytes().
   * @param {Array.<number>} bytes sequence of given charset.
   * @param {string=} opt_charset name of charset.
   * @return {string} decoded string.
   */
  _.bytesToString = function(bytes, opt_charset) {
    var charset = opt_charset || 'UTF-8';
    var str = null;

    // try native TextDecoder first
    if (self.TextDecoder && self.Uint8Array && self.Uint8Array['from']) {
      try {
        var decoder = new self.TextDecoder(charset);
        return decoder.decode(self.Uint8Array['from'](bytes));
      } catch (ignored) {
        // try other methods if charset is not supported by native decoder (eg. CP437 on Chrome).
      }
    }
    if (charset == 'UTF-8') {
      str = utf8.UTF8BytesToString(bytes);
    } else if (iconvlite.isSupported(charset)) {
      str = iconvlite.toString(bytes, charset);
    } else {
      if (!iconv)
        throw new InvalidCharsetError(
          'iconv not loaded, cannot handle ' + charset);
      var utf8Bytes = iconv.convert(bytes, charset, 'UTF-8');
      if (utf8Bytes === null)
        throw new InvalidCharsetError(
          'toStr ' + charset + ' to UTF-8 ' + bytes);
      bytes = utf8Bytes;
      str = utf8.UTF8BytesToString(bytes);
    }
    if (str === null)
      throw new InvalidCharsetError();
    return str;
  };

  /**
   * Note: charset is currently ignored.
   * Decodes bytes bytes array as returned by getBytes().
   * @param {string} str to encode.
   * @param {string=} opt_charset name of charset.
   * @return {Array.<number>} bytes.
   */
  _.stringToBytes = function(str, opt_charset) {
    var charset = opt_charset || 'UTF-8';
    var bytes = null;
    if (charset == 'UTF-8') {
      bytes = utf8.stringToUTF8Bytes(str);
      if (bytes === null)
        throw new InvalidCharsetError();
    } else if (iconvlite.isSupported(charset)) {
      bytes = iconvlite.toBytes(str, charset);
    } else {
      bytes = utf8.stringToUTF8Bytes(str);
      if (!iconv)
        throw new InvalidCharsetError('iconv not loaded');
      bytes = iconv.convert(bytes, 'UTF-8', charset);
    }
    if (bytes === null)
      throw new InvalidCharsetError(charset + ' to bytes: ' + str);
    return bytes;
  };

  /**
   * @param {Array.<number>} bytes bytes encoding a string, whose encoding
   * should be guessed.
   * @param {Object=} opt_hints decode hints if applicable.
   * @return {string} name of guessed encoding; at the moment will only
   * guess one of:
   *  {@link #SHIFT_JIS}, {@link #UTF8}, {@link #ISO88591}, or the platform
   *  default encoding if none of these can possibly be correct.
   */
  _.guessEncoding = function(bytes, opt_hints) {
    if (opt_hints) {
      var characterSet = opt_hints.get(w69b.qr.DecodeHintType.CHARACTER_SET);
      if (characterSet) {
        return characterSet;
      }
    }
    // For now, merely tries to distinguish ISO-8859-1, UTF-8 and Shift_JIS,
    // which should be by far the most common encodings.
    var length = bytes.length;
    var canBeISO88591 = true;
    var canBeShiftJIS = true;
    var canBeUTF8 = true;
    var utf8BytesLeft = 0;
    //var utf8LowChars = 0;
    var utf2BytesChars = 0;
    var utf3BytesChars = 0;
    var utf4BytesChars = 0;
    var sjisBytesLeft = 0;
    //var sjisLowChars = 0;
    var sjisKatakanaChars = 0;
    //var sjisDoubleBytesChars = 0;
    var sjisCurKatakanaWordLength = 0;
    var sjisCurDoubleBytesWordLength = 0;
    var sjisMaxKatakanaWordLength = 0;
    var sjisMaxDoubleBytesWordLength = 0;
    //var isoLowChars = 0;
    //var isoHighChars = 0;
    var isoHighOther = 0;

    var utf8bom = bytes.length > 3 &&
      bytes[0] == 0xEF &&
      bytes[1] == 0xBB &&
      bytes[2] == 0xBF;

    for (var i = 0;
         i < length && (canBeISO88591 || canBeShiftJIS || canBeUTF8);
         i++) {

      var value = bytes[i] & 0xFF;

      // UTF-8 stuff
      if (canBeUTF8) {
        if (utf8BytesLeft > 0) {
          if ((value & 0x80) == 0) {
            canBeUTF8 = false;
          } else {
            utf8BytesLeft--;
          }
        } else if ((value & 0x80) != 0) {
          if ((value & 0x40) == 0) {
            canBeUTF8 = false;
          } else {
            utf8BytesLeft++;
            if ((value & 0x20) == 0) {
              utf2BytesChars++;
            } else {
              utf8BytesLeft++;
              if ((value & 0x10) == 0) {
                utf3BytesChars++;
              } else {
                utf8BytesLeft++;
                if ((value & 0x08) == 0) {
                  utf4BytesChars++;
                } else {
                  canBeUTF8 = false;
                }
              }
            }
          }
        } //else {
        //utf8LowChars++;
        //}
      }

      // ISO-8859-1 stuff
      if (canBeISO88591) {
        if (value > 0x7F && value < 0xA0) {
          canBeISO88591 = false;
        } else if (value > 0x9F) {
          if (value < 0xC0 || value == 0xD7 || value == 0xF7) {
            isoHighOther++;
          } //else {
          //isoHighChars++;
          //}
        } //else {
        //isoLowChars++;
        //}
      }

      // Shift_JIS stuff
      if (canBeShiftJIS) {
        if (sjisBytesLeft > 0) {
          if (value < 0x40 || value == 0x7F || value > 0xFC) {
            canBeShiftJIS = false;
          } else {
            sjisBytesLeft--;
          }
        } else if (value == 0x80 || value == 0xA0 || value > 0xEF) {
          canBeShiftJIS = false;
        } else if (value > 0xA0 && value < 0xE0) {
          sjisKatakanaChars++;
          sjisCurDoubleBytesWordLength = 0;
          sjisCurKatakanaWordLength++;
          if (sjisCurKatakanaWordLength > sjisMaxKatakanaWordLength) {
            sjisMaxKatakanaWordLength = sjisCurKatakanaWordLength;
          }
        } else if (value > 0x7F) {
          sjisBytesLeft++;
          //sjisDoubleBytesChars++;
          sjisCurKatakanaWordLength = 0;
          sjisCurDoubleBytesWordLength++;
          if (sjisCurDoubleBytesWordLength > sjisMaxDoubleBytesWordLength) {
            sjisMaxDoubleBytesWordLength = sjisCurDoubleBytesWordLength;
          }
        } else {
          //sjisLowChars++;
          sjisCurKatakanaWordLength = 0;
          sjisCurDoubleBytesWordLength = 0;
        }
      }
    }

    if (canBeUTF8 && utf8BytesLeft > 0) {
      canBeUTF8 = false;
    }
    if (canBeShiftJIS && sjisBytesLeft > 0) {
      canBeShiftJIS = false;
    }

    // Easy -- if there is BOM or at least 1 valid not-single byte character
    // (and no evidence it can't be UTF-8), done
    if (canBeUTF8 &&
      (utf8bom || utf2BytesChars + utf3BytesChars + utf4BytesChars > 0)) {
      return _.UTF8;
    }
    // Easy -- if assuming Shift_JIS or at least 3 valid consecutive not-ascii
    // characters (and no evidence it can't be), done
    if (canBeShiftJIS &&
      (_.ASSUME_SHIFT_JIS || sjisMaxKatakanaWordLength >= 3 ||
        sjisMaxDoubleBytesWordLength >= 3)) {
      return _.SHIFT_JIS;
    }
    // Distinguishing Shift_JIS and ISO-8859-1 can be a little tough for short
    // words. The crude heuristic is:
    // - If we saw
    //   - only two consecutive katakana chars in the whole text, or
    //   - at least 10% of bytes that could be "upper" not-alphanumeric Latin1,
    // - then we conclude Shift_JIS, else ISO-8859-1
    if (canBeISO88591 && canBeShiftJIS) {
      return (sjisMaxKatakanaWordLength == 2 && sjisKatakanaChars == 2) ||
        isoHighOther * 10 >= length ? _.SHIFT_JIS : _.ISO88591;
    }

    // Otherwise, try in order ISO-8859-1, Shift JIS, UTF-8 and fall back to
    // default platform encoding
    if (canBeISO88591) {
      return _.ISO88591;
    }
    if (canBeShiftJIS) {
      return _.SHIFT_JIS;
    }
    if (canBeUTF8) {
      return _.UTF8;
    }
    // Otherwise, we take a wild guess with platform encoding
    return _.PLATFORM_DEFAULT_ENCODING;
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.DecodedBitStreamParser');
goog.require('goog.string.StringBuffer');
goog.require('w69b.qr.BitSource');
goog.require('w69b.qr.CharacterSetECI');
goog.require('w69b.qr.FormatError');
goog.require('w69b.qr.Mode');
goog.require('w69b.qr.ModeEnum');
goog.require('w69b.qr.stringutils');

goog.scope(function() {
  var _ = w69b.qr.DecodedBitStreamParser;
  var BitSource = w69b.qr.BitSource;
  var Mode = w69b.qr.Mode;
  var ModeEnum = w69b.qr.ModeEnum;
  var StringBuffer = goog.string.StringBuffer;
  var stringutils = w69b.qr.stringutils;
  var FormatError = w69b.qr.FormatError;
  var CharacterSetECI = w69b.qr.CharacterSetECI;

  /**
   * <p>QR Codes can encode text as bits in one of several modes, and can use
   * multiple modes in one QR Code. This class decodes the bits back into
   * text.</p>
   *
   * <p>See ISO 18004:2006, 6.4.3 - 6.4.7</p>
   *
   * @author Sean Owen
   */

  /**
   * See ISO 18004:2006, 6.4.4 Table 5
   */
  _.ALPHANUMERIC_CHARS = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B',
    'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    ' ', '$', '%', '*', '+', '-', '.', '/', ':'
  ];
  _.GB2312_SUBSET = 1;


  /**
   * @param {Array.<number>} bytes byte blocks.
   * @param {w69b.qr.Version} version qr code version.
   * @param {w69b.qr.ErrorCorrectionLevel} ecLevel error correction level.
   * @return {string} decoded string.
   */
  _.decode = function(bytes, version, ecLevel) {
    var bits = new BitSource(bytes);
    var result = new StringBuffer();
    /**
     * @type {Array.<number>}
     */
    var byteSegments = [];
    var fc1InEffect = false;
    var mode;
    var currentCharacterSet = null;
    do {
      // While still another segment to read...
      if (bits.available() < 4) {
        // OK, assume we're done. Really, a TERMINATOR mode should have been
        // recorded here
        mode = ModeEnum.TERMINATOR;
      } else {
        mode = Mode.forBits(bits.readBits(4)); // mode is encoded by 4 bits
      }
      if (mode != ModeEnum.TERMINATOR) {
        if (mode == ModeEnum.FNC1_FIRST_POSITION ||
          mode == ModeEnum.FNC1_SECOND_POSITION) {
          // We do little with FNC1 except alter the parsed result a bit
          // according to the spec
          fc1InEffect = true;
        } else if (mode == ModeEnum.STRUCTURED_APPEND) {
          if (bits.available() < 16) {
            throw new FormatError();  // FormatException.getFormatInstance();
          }
          // not really supported; all we do is ignore it Read next 8 bits
          // (symbol sequence #) and 8 bits (parity data), then continue
          bits.readBits(16);
        } else if (mode == ModeEnum.ECI) {
          // Count doesn't apply to ECI
          var value = _.parseECIValue(bits);
          currentCharacterSet = CharacterSetECI.getName(value);
          if (currentCharacterSet == null)
            throw new FormatError();
        } else {
          // First handle Hanzi mode which does not start with character count
          if (mode == ModeEnum.HANZI) {
            //chinese mode contains a sub set indicator right after mode
            //indicator
            var subset = bits.readBits(4);
            var countHanzi = bits.readBits(
              mode.getCharacterCountBits(version));
            if (subset == _.GB2312_SUBSET) {
              _.decodeHanziSegment(bits, result, countHanzi);
            }
          } else {
            // "Normal" QR code modes:
            // How many characters will follow, encoded in this mode?
            var count = bits.readBits(mode.getCharacterCountBits(version));
            if (mode == ModeEnum.NUMERIC) {
              _.decodeNumericSegment(bits, result, count);
            } else if (mode == ModeEnum.ALPHANUMERIC) {
              _.decodeAlphanumericSegment(bits, result, count, fc1InEffect);
            } else if (mode == ModeEnum.BYTE) {
              _.decodeByteSegment(bits, result, count,
                currentCharacterSet, byteSegments);
            } else if (mode == ModeEnum.KANJI) {
              _.decodeKanjiSegment(bits, result, count);
            } else {
              throw new FormatError();  //FormatException.getFormatInstance();
            }
          }
        }
      }
    } while (mode != ModeEnum.TERMINATOR);

    return result.toString();
  };

  /**
   * See specification GBT 18284-2000
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   */
  _.decodeHanziSegment = function(bits, result, count) {
    // Don't crash trying to read more bits than we have available.
    if (count * 13 > bits.available()) {
      throw new FormatError();  // FormatException.getFormatInstance();
    }

    // Each character will require 2 bytes. Read the characters as 2-byte pairs
    // and decode as GB2312 afterwards
    var buffer = new Array(2 * count);
    var offset = 0;
    while (count > 0) {
      // Each 13 bits encodes a 2-byte character
      var twoBytes = bits.readBits(13);
      var assembledTwoBytes = ((twoBytes / 0x060) << 8) | (twoBytes % 0x060);
      if (assembledTwoBytes < 0x003BF) {
        // In the 0xA1A1 to 0xAAFE range
        assembledTwoBytes += 0x0A1A1;
      } else {
        // In the 0xB0A1 to 0xFAFE range
        assembledTwoBytes += 0x0A6A1;
      }
      buffer[offset] = ((assembledTwoBytes >> 8) & 0xFF);
      buffer[offset + 1] = (assembledTwoBytes & 0xFF);
      offset += 2;
      count--;
    }

    result.append(stringutils.bytesToString(buffer, 'GB2312'));
    // result.append(new String(buffer, StringUtils.GB2312));
  };

  /**
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   */
  _.decodeKanjiSegment = function(bits, result, count) {
    // Don't crash trying to read more bits than we have available.
    if (count * 13 > bits.available()) {
      throw new FormatError();
    }

    // Each character will require 2 bytes. Read the characters as 2-byte pairs
    // and decode as Shift_JIS afterwards
    var buffer = new Array(2 * count);
    var offset = 0;
    while (count > 0) {
      // Each 13 bits encodes a 2-byte character
      var twoBytes = bits.readBits(13);
      var assembledTwoBytes = ((twoBytes / 0x0C0) << 8) | (twoBytes % 0x0C0);
      if (assembledTwoBytes < 0x01F00) {
        // In the 0x8140 to 0x9FFC range
        assembledTwoBytes += 0x08140;
      } else {
        // In the 0xE040 to 0xEBBF range
        assembledTwoBytes += 0x0C140;
      }
      buffer[offset] = (assembledTwoBytes >> 8);
      buffer[offset + 1] = assembledTwoBytes;
      offset += 2;
      count--;
    }
    // Shift_JIS may not be supported in some environments:
    result.append(stringutils.bytesToString(buffer, 'SJIS'));
  };

  /**
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   * @param {?string} characterSetEciName character set eci name.
   * @param {Array.<number>} byteSegments raw bytes.
   */
  _.decodeByteSegment = function(bits, result, count,
                                 characterSetEciName, byteSegments) {
    // Don't crash trying to read more bits than we have available.
    if (count << 3 > bits.available()) {
      throw new FormatError();  //FormatException.getFormatInstance();
    }

    var readBytes = new Array(count);
    for (var i = 0; i < count; i++) {
      readBytes[i] = bits.readBits(8);
    }
    // var encoding = stringutils.guessEncoding(readBytes);
    // TODO: We cannot decode non-unicode strings yet.
    var encoding;
    if (!characterSetEciName) {
      // The spec isn't clear on this mode; see
      // section 6.4.5: t does not say which encoding to assuming
      // upon decoding. I have seen ISO-8859-1 used as well as
      // Shift_JIS -- without anything like an ECI designator to
      // give a hint.
      encoding = stringutils.guessEncoding(readBytes);
    } else {
      encoding = characterSetEciName;
    }
    result.append(stringutils.bytesToString(readBytes, encoding));
    byteSegments.push(readBytes);
  };

  /**
   * @param {number} value character.
   * @return {string} char.
   */
  _.toAlphaNumericChar = function(value) {
    if (value >= _.ALPHANUMERIC_CHARS.length) {
      throw new FormatError();  // FormatException.getFormatInstance();
    }
    return _.ALPHANUMERIC_CHARS[Math.floor(value)];
  };

  /**
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   * @param {boolean} fc1InEffect flag.
   */
  _.decodeAlphanumericSegment = function(bits, result, count, fc1InEffect) {
    // Read two characters at a time
    var start = result.getLength();
    while (count > 1) {
      if (bits.available() < 11) {
        throw new FormatError();  // throw FormatException.getFormatInstance();
      }
      var nextTwoCharsBits = bits.readBits(11);
      result.append(_.toAlphaNumericChar(nextTwoCharsBits / 45));
      result.append(_.toAlphaNumericChar(nextTwoCharsBits % 45));
      count -= 2;
    }
    if (count == 1) {
      // special case: one character left
      if (bits.available() < 6) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      result.append(_.toAlphaNumericChar(bits.readBits(6)));
    }
    // See section 6.4.8.1, 6.4.8.2
    // if (fc1InEffect) {
    //   // We need to massage the result a bit if in an FNC1 mode:
    //   // TODO: subclass stringbuffer and add required methods.
    //   for (var i = start; i < result.getLength(); i++) {
    //     if (result.charAt(i) == '%') {
    //       if (i < result.length() - 1 && result.charAt(i + 1) == '%') {
    //         // %% is rendered as %
    //         result.deleteCharAt(i + 1);
    //       } else {
    //         // In alpha mode, % should be converted to FNC1 separator 0x1D
    //         result.setCharAt(i, 0x1D);
    //       }
    //     }
    //   }
    // }
  };

  /**
   * @param {BitSource} bits bits.
   * @param {StringBuffer} result string buffer.
   * @param {number} count bytes to decode.
   */
  _.decodeNumericSegment = function(bits, result, count) {
    // Read three digits at a time
    while (count >= 3) {
      // Each 10 bits encodes three digits
      if (bits.available() < 10) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      var threeDigitsBits = bits.readBits(10);
      if (threeDigitsBits >= 1000) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      result.append(_.toAlphaNumericChar(threeDigitsBits / 100));
      result.append(_.toAlphaNumericChar((threeDigitsBits / 10) % 10));
      result.append(_.toAlphaNumericChar(threeDigitsBits % 10));
      count -= 3;
    }
    if (count == 2) {
      // Two digits left over to read, encoded in 7 bits
      if (bits.available() < 7) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      var twoDigitsBits = bits.readBits(7);
      if (twoDigitsBits >= 100) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      result.append(_.toAlphaNumericChar(twoDigitsBits / 10));
      result.append(_.toAlphaNumericChar(twoDigitsBits % 10));
    } else if (count == 1) {
      // One digit left over to read
      if (bits.available() < 4) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      var digitBits = bits.readBits(4);
      if (digitBits >= 10) {
        throw new FormatError();  // FormatException.getFormatInstance();
      }
      result.append(_.toAlphaNumericChar(digitBits));
    }
  };

  _.parseECIValue = function(bits) {
    var firstByte = bits.readBits(8);
    if ((firstByte & 0x80) == 0) {
      // just one byte
      return firstByte & 0x7F;
    }
    if ((firstByte & 0xC0) == 0x80) {
      // two bytes
      var secondByte = bits.readBits(8);
      return ((firstByte & 0x3F) << 8) | secondByte;
    }
    if ((firstByte & 0xE0) == 0xC0) {
      // three bytes
      var secondThirdBytes = bits.readBits(16);
      return ((firstByte & 0x1F) << 16) | secondThirdBytes;
    }
    throw new FormatError();  // FormatException.getFormatInstance();
  };

});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.GF256Poly');
goog.require('goog.asserts');

/**
 * <p>Represents a polynomial whose coefficients are elements of a GF.
 * Instances of this class are immutable.</p>
 *
 * <p>Much credit is due to William Rucklidge since portions of this code
 * are an indirect port of his C++ Reed-Solomon implementation.</p>
 *
 * @author Sean Owen
 */


goog.scope(function() {

  /**
   * GF256Polys do not have same GF256 field.
   * @param {string=} opt_message Additional message.
   * @constructor
   * @extends {Error}
   */
  w69b.qr.WrongFieldError = function(opt_message) {
    goog.base(this, opt_message);
  };
  goog.inherits(w69b.qr.WrongFieldError, Error);
  var WrongFieldError = w69b.qr.WrongFieldError;



  /**
   * @param {!w69b.qr.GF256} field field.
   * @param {Array} coefficients coefficients.
   * @constructor
   */
  w69b.qr.GF256Poly = function(field, coefficients) {
    goog.asserts.assert(coefficients != null && coefficients.length != 0);
    this.field = field;
    var coefficientsLength = coefficients.length;
    if (coefficientsLength > 1 && coefficients[0] == 0) {
      // Leading term must be non-zero for anything except the constant
      // polynomial "0"
      var firstNonZero = 1;
      while (firstNonZero < coefficientsLength &&
        coefficients[firstNonZero] == 0) {
        firstNonZero++;
      }
      if (firstNonZero == coefficientsLength) {
        this.coefficients = field.zero.coefficients;
      } else {
        this.coefficients = new Array(coefficientsLength - firstNonZero);
        for (var i = 0; i < this.coefficients.length; i++)this.coefficients[i] =
          0;
        for (var ci = 0; ci <
          this.coefficients.length; ci++)this.coefficients[ci] =
          coefficients[firstNonZero + ci];
      }
    } else {
      this.coefficients = coefficients;
    }
  };
  var GF256Poly = w69b.qr.GF256Poly;
  var pro = GF256Poly.prototype;


  /**
   * Calculates a ^ b.
   * @param {number} a number.
   * @param {number} b number.
   * @return {number} result.
   */
  GF256Poly.addOrSubtractScalar = function(a, b) {
    return a ^ b;
  };

  pro.isZero = function() {
    return this.coefficients[0] == 0;
  };

  pro.getDegree = function() {
    return this.coefficients.length - 1;
  };

  pro.getCoefficient = function(degree) {
    return this.coefficients[this.coefficients.length - 1 - degree];
  };

  pro.evaluateAt = function(a) {
    if (a == 0) {
      // Just return the x^0 coefficient
      return this.getCoefficient(0);
    }
    var size = this.coefficients.length;
    if (a == 1) {
      // Just the sum of the coefficients
      var result = 0;
      for (var i = 0; i < size; i++) {
        result = GF256Poly.addOrSubtractScalar(result, this.coefficients[i]);
      }
      return result;
    }
    var result2 = this.coefficients[0];
    for (var i = 1; i < size; i++) {
      result2 = GF256Poly.addOrSubtractScalar(this.field.multiply(a, result2),
        this.coefficients[i]);
    }
    return result2;
  };

  /**
   * Add or substract other  poly.
   * @param {!w69b.qr.GF256Poly} other other poly.
   * @return {!w69b.qr.GF256Poly} result.
   */
  pro.addOrSubtract = function(other) {
    if (this.field != other.field) {
      throw new WrongFieldError();
    }
    if (this.isZero()) {
      return other;
    }
    if (other.isZero()) {
      return this;
    }

    var smallerCoefficients = this.coefficients;
    var largerCoefficients = other.coefficients;
    if (smallerCoefficients.length > largerCoefficients.length) {
      var temp = smallerCoefficients;
      smallerCoefficients = largerCoefficients;
      largerCoefficients = temp;
    }
    var sumDiff = new Array(largerCoefficients.length);
    var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
    // Copy high-order terms only found in higher-degree polynomial's
    // coefficients
    for (var ci = 0; ci < lengthDiff; ci++)sumDiff[ci] =
      largerCoefficients[ci];

    for (var i = lengthDiff; i < largerCoefficients.length; i++) {
      sumDiff[i] = GF256Poly.addOrSubtractScalar(
        smallerCoefficients[i - lengthDiff],
        largerCoefficients[i]);
    }

    return new GF256Poly(this.field, sumDiff);
  };

  /**
   * Multiply with other poly.
   * @param {!w69b.qr.GF256Poly} other other poly.
   * @return {w69b.qr.GF256Poly} result.
   */
  pro.multiply1 = function(other) {
    if (this.field != other.field) {
      throw new WrongFieldError();
    }
    if (this.isZero() || other.isZero()) {
      return this.field.zero;
    }
    var aCoefficients = this.coefficients;
    var aLength = aCoefficients.length;
    var bCoefficients = other.coefficients;
    var bLength = bCoefficients.length;
    var product = new Array(aLength + bLength - 1);
    for (var i = 0; i < aLength; i++) {
      var aCoeff = aCoefficients[i];
      for (var j = 0; j < bLength; j++) {
        product[i + j] = GF256Poly.addOrSubtractScalar(product[i + j],
          this.field.multiply(aCoeff, bCoefficients[j]));
      }
    }
    return new GF256Poly(this.field, product);
  };

  /**
   * Multiply with scalar.
   * @param {!number} scalar other poly.
   * @return {w69b.qr.GF256Poly} result.
   */
  pro.multiply2 = function(scalar) {
    if (scalar == 0) {
      return this.field.zero;
    }
    if (scalar == 1) {
      return this;
    }
    var size = this.coefficients.length;
    var product = new Array(size);
    for (var i = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], scalar);
    }
    return new GF256Poly(this.field, product);
  };
  /**
   * TODO.
   * @return {!w69b.qr.GF256Poly} result.
   */
  pro.multiplyByMonomial = function(degree, coefficient) {
    goog.asserts.assert(degree >= 0);
    if (coefficient == 0) {
      return this.field.zero;
    }
    var size = this.coefficients.length;
    var product = new Array(size + degree);
    for (var i = 0; i < product.length; i++) {
      product[i] = 0;
    }
    for (var i = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], coefficient);
    }
    return new GF256Poly(this.field, product);
  };

  /**
   * Divide by other poly.
   * @param {!w69b.qr.GF256Poly} other other poly.
   * @return {Array.<w69b.qr.GF256Poly>} result (quotient, remainder).
   */
  pro.divide = function(other) {
    if (this.field != other.field) {
      throw new WrongFieldError();
    }
    goog.asserts.assert(!other.isZero());

    var quotient = this.field.zero;
    var remainder = this;

    var denominatorLeadingTerm = other.getCoefficient(other.getDegree());
    var inverseDenominatorLeadingTerm = this.field.inverse(
      denominatorLeadingTerm);

    while (remainder.getDegree() >= other.getDegree() && !remainder.isZero()) {
      var degreeDifference = remainder.getDegree() - other.getDegree();
      var scale = this.field.multiply(
        remainder.getCoefficient(remainder.getDegree()),
        inverseDenominatorLeadingTerm);
      var term = other.multiplyByMonomial(degreeDifference, scale);
      var iterationQuotient = this.field.buildMonomial(degreeDifference,
        scale);
      quotient = quotient.addOrSubtract(iterationQuotient);
      remainder = remainder.addOrSubtract(term);
    }

    return new Array(quotient, remainder);
  };

  pro.toString = function() {
    var result = [];
    for (var degree = this.getDegree(); degree >= 0; degree--) {
      var coefficient = this.getCoefficient(degree);
      if (coefficient != 0) {
        if (coefficient < 0) {
          result.push(' - ');
          coefficient = -coefficient;
        } else {
          if (result.length > 0) {
            result.push(' + ');
          }
        }
        if (degree == 0 || coefficient != 1) {
          var alphaPower = this.field.log(coefficient);
          if (alphaPower == 0) {
            result.push('1');
          } else if (alphaPower == 1) {
            result.push('a');
          } else {
            result.push('a^');
            result.push(alphaPower);
          }
        }
        if (degree != 0) {
          if (degree == 1) {
            result.push('x');
          } else {
            result.push('x^');
            result.push(degree);
          }
        }
      }
    }
    return result.join('');
  };


});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.GF256');
goog.require('w69b.qr.GF256Poly');

goog.scope(function() {
  var GF256Poly = w69b.qr.GF256Poly;

  /**
   * @param {number} primitive number.
   * @constructor
   */
  w69b.qr.GF256 = function(primitive) {
    this.expTable = new Array(256);
    this.logTable = new Array(256);
    var x = 1;
    for (var i = 0; i < 256; i++) {
      this.expTable[i] = x;
      x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
      if (x >= 0x100) {
        x ^= primitive;
      }
    }
    for (var i = 0; i < 255; i++) {
      this.logTable[this.expTable[i]] = i;
    }
    // logTable[0] == 0 but this should never be used
    var at0 = new Array(1);
    at0[0] = 0;
    this.zero = new GF256Poly(this, new Array(at0));
    var at1 = new Array(1);
    at1[0] = 1;
    this.one = new GF256Poly(this, new Array(at1));
  };
  var GF256 = w69b.qr.GF256;
  var pro = GF256.prototype;

  /**
   * @return {!GF256Poly} poly.
   */
  pro.buildMonomial = function(degree, coefficient) {
    if (degree < 0) {
      throw Error();
    }
    if (coefficient == 0) {
      return this.zero;
    }
    var coefficients = new Array(degree + 1);
    for (var i = 0; i < coefficients.length; i++)coefficients[i] = 0;
    coefficients[0] = coefficient;
    return new GF256Poly(this, coefficients);
  };
  pro.exp = function(a) {
    return this.expTable[a];
  };
  pro.log = function(a) {
    if (a == 0) {
      throw Error();
    }
    return this.logTable[a];
  };
  pro.inverse = function(a) {
    if (a == 0) {
      throw Error();
    }
    return this.expTable[255 - this.logTable[a]];
  };
  pro.multiply = function(a, b) {
    if (a == 0 || b == 0) {
      return 0;
    }
    if (a == 1) {
      return b;
    }
    if (b == 1) {
      return a;
    }
    return this.expTable[(this.logTable[a] + this.logTable[b]) % 255];
  };

  GF256.QR_CODE_FIELD = new GF256(0x011D);
  GF256.DATA_MATRIX_FIELD = new GF256(0x012D);

});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.ReedSolomonDecoder');
goog.require('w69b.qr.GF256Poly');
goog.require('w69b.qr.ReaderError');

/**
 * <p>Implements Reed-Solomon decoding, as the name implies.</p>
 *
 * <p>The algorithm will not be explained here, but the following references
 * were helpful
 * in creating this implementation:</p>
 *
 * <ul>
 * <li>Bruce Maggs.
 * <a href="http://www.cs.cmu.edu/afs/cs.cmu.edu/project/pscico-guyb/realworld
 * /www/rs_decode.ps">
 * "Decoding Reed-Solomon Codes"</a> (see discussion of Forney's Formula)</li>
 * <li>J.I. Hall. <a href="www.mth.msu.edu/~jhall/classes/codenotes/GRS.pdf">
 * "Chapter 5. Generalized Reed-Solomon Codes"</a>
 * (see discussion of Euclidean algorithm)</li>
 * </ul>
 *
 * <p>Much credit is due to William Rucklidge since portions of this code are
 * an indirect port of his C++ Reed-Solomon implementation.</p>
 *
 * @author Sean Owen
 * @author William Rucklidge
 * @author sanfordsquires
 */


goog.scope(function() {
  var GF256Poly = w69b.qr.GF256Poly;

  /**
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {w69b.qr.ReaderError}
   */
  w69b.qr.ReedSolomonError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.ReedSolomonError, w69b.qr.ReaderError);
  var ReedSolomonError = w69b.qr.ReedSolomonError;
  /**
   * @constructor
   * @param {!w69b.qr.GF256} field field.
   */
  w69b.qr.ReedSolomonDecoder = function(field) {
    this.field = field;
  };
  var ReedSolomonDecoder = w69b.qr.ReedSolomonDecoder;
  var pro = ReedSolomonDecoder.prototype;

  /**
   * <p>Decodes given set of received codewords, which include both data and
   * error-correction codewords.
   * Really, this means it uses Reed-Solomon to detect and correct  errors,
   * in-place, in the input.</p>
   *
   * @param {Array.<number>} received data and error-correction codewords.
   * @param {number} twoS number of error-correction codewords available.
   */
  pro.decode = function(received, twoS) {
    var poly = new GF256Poly(this.field, received);
    var syndromeCoefficients = new Array(twoS);
    for (var i = 0; i <
      syndromeCoefficients.length; i++)syndromeCoefficients[i] = 0;
    var dataMatrix = false;//this.field.Equals(GF256.DATA_MATRIX_FIELD);
    var noError = true;
    for (var i = 0; i < twoS; i++) {
      // Thanks to sanfordsquires for this fix:
      var val = poly.evaluateAt(this.field.exp(dataMatrix ? i + 1 : i));
      syndromeCoefficients[syndromeCoefficients.length - 1 - i] = val;
      if (val != 0) {
        noError = false;
      }
    }
    if (noError) {
      return;
    }
    var syndrome = new GF256Poly(this.field, syndromeCoefficients);
    var sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS,
      1), syndrome, twoS);
    var sigma = sigmaOmega[0];
    var omega = sigmaOmega[1];
    var errorLocations = this.findErrorLocations(sigma);
    var errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations,
      dataMatrix);
    for (var i = 0; i < errorLocations.length; i++) {
      var position = received.length - 1 - this.field.log(errorLocations[i]);
      if (position < 0) {
        throw new ReedSolomonError('bad error location');
      }
      received[position] = GF256Poly.addOrSubtractScalar(received[position],
        errorMagnitudes[i]);
    }
  };

  pro.runEuclideanAlgorithm = function(a, b, R) {
    // Assume a's degree is >= b's
    if (a.getDegree() < b.getDegree()) {
      var temp = a;
      a = b;
      b = temp;
    }

    var rLast = a;
    var r = b;
    var sLast = this.field.one;
    var s = this.field.zero;
    var tLast = this.field.zero;
    var t = this.field.one;

    // Run Euclidean algorithm until r's degree is less than R/2
    while (r.getDegree() >= Math.floor(R / 2)) {
      var rLastLast = rLast;
      var sLastLast = sLast;
      var tLastLast = tLast;
      rLast = r;
      sLast = s;
      tLast = t;

      // Divide rLastLast by rLast, with quotient in q and remainder in r
      if (rLast.isZero()) {
        // Oops, Euclidean algorithm already terminated?
        throw new ReedSolomonError('r_{i-1} was zero');
      }
      r = rLastLast;
      var q = this.field.zero;
      var denominatorLeadingTerm = rLast.getCoefficient(rLast.getDegree());
      var dltInverse = this.field.inverse(denominatorLeadingTerm);
      while (r.getDegree() >= rLast.getDegree() && !r.isZero()) {
        var degreeDiff = r.getDegree() - rLast.getDegree();
        var scale = this.field.multiply(r.getCoefficient(r.getDegree()),
          dltInverse);
        q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
        r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
        //r.EXE();
      }

      s = q.multiply1(sLast).addOrSubtract(sLastLast);
      t = q.multiply1(tLast).addOrSubtract(tLastLast);
    }

    var sigmaTildeAtZero = t.getCoefficient(0);
    if (sigmaTildeAtZero == 0) {
      throw new ReedSolomonError('sigmaTilde(0) was zero');
    }

    var inverse = this.field.inverse(sigmaTildeAtZero);
    var sigma = t.multiply2(inverse);
    var omega = r.multiply2(inverse);
    return new Array(sigma, omega);
  };
  pro.findErrorLocations = function(errorLocator) {
    // This is a direct application of Chien's search
    var numErrors = errorLocator.getDegree();
    if (numErrors == 1) {
      // shortcut
      return [errorLocator.getCoefficient(1)];
    }
    var result = new Array(numErrors);
    var e = 0;
    for (var i = 1; i < 256 && e < numErrors; i++) {
      if (errorLocator.evaluateAt(i) == 0) {
        result[e] = this.field.inverse(i);
        e++;
      }
    }
    if (e != numErrors) {
      throw new ReedSolomonError('locator degree does not match ' +
        'number of roots');
    }
    return result;
  };
  pro.findErrorMagnitudes =
    function(errorEvaluator, errorLocations, dataMatrix) {
      // This is directly applying Forney's Formula
      var s = errorLocations.length;
      var result = new Array(s);
      for (var i = 0; i < s; i++) {
        var xiInverse = this.field.inverse(errorLocations[i]);
        var denominator = 1;
        for (var j = 0; j < s; j++) {
          if (i != j) {
            denominator =
              this.field.multiply(denominator, GF256Poly.addOrSubtractScalar(1,
                this.field.multiply(errorLocations[j], xiInverse)));
          }
        }
        result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse),
          this.field.inverse(denominator));
        // Thanks to sanfordsquires for this fix:
        if (dataMatrix) {
          result[i] = this.field.multiply(result[i], xiInverse);
        }
      }
      return result;
    };
});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.decoder');
goog.require('w69b.qr.BitMatrixParser');
goog.require('w69b.qr.DataBlock');
goog.require('w69b.qr.DecodedBitStreamParser');
goog.require('w69b.qr.GF256');
goog.require('w69b.qr.ReedSolomonDecoder');

goog.scope(function() {
  var GF256 = w69b.qr.GF256;
  var DataBlock = w69b.qr.DataBlock;

  var _ = w69b.qr.decoder;
  _.rsDecoder = new w69b.qr.ReedSolomonDecoder(GF256.QR_CODE_FIELD);

  _.correctErrors = function(codewordBytes, numDataCodewords) {
    var numCodewords = codewordBytes.length;
    // First read into an array of ints
    var codewordsInts = new Array(numCodewords);
    for (var i = 0; i < numCodewords; i++) {
      codewordsInts[i] = codewordBytes[i] & 0xFF;
    }
    var numECCodewords = codewordBytes.length - numDataCodewords;
    _.rsDecoder.decode(codewordsInts, numECCodewords);
      //var corrector = new ReedSolomon(codewordsInts, numECCodewords);
      //corrector.correct();
    // Copy back into array of bytes -- only need to worry about the bytes that
    // were data We don't care about errors in the error-correction codewords
    for (var i = 0; i < numDataCodewords; i++) {
      codewordBytes[i] = codewordsInts[i];
    }
  };

  /**
   * @param {w69b.qr.BitMatrix} bits matrix.
   * @return {string} reader instnance.
   */
  _.decode = function(bits) {
    var parser = new w69b.qr.BitMatrixParser(bits);
    var version = parser.readVersion();
    var ecLevel = parser.readFormatInformation().errorCorrectionLevel;

    // Read codewords
    var codewords = parser.readCodewords();

    // Separate into data blocks
    var dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel);

    // Count total number of data bytes
    var totalBytes = 0;
    for (var i = 0; i < dataBlocks.length; i++) {
      totalBytes += dataBlocks[i].numDataCodewords;
    }
    var resultBytes = new Array(totalBytes);
    var resultOffset = 0;

    // Error-correct and copy data blocks together into a stream of bytes
    for (var j = 0; j < dataBlocks.length; j++) {
      var dataBlock = dataBlocks[j];
      var codewordBytes = dataBlock.codewords;
      var numDataCodewords = dataBlock.numDataCodewords;
      _.correctErrors(codewordBytes, numDataCodewords);
      for (var i = 0; i < numDataCodewords; i++) {
        resultBytes[resultOffset++] = codewordBytes[i];
      }
    }

    // Decode the contents of that stream of bytes
    return w69b.qr.DecodedBitStreamParser.decode(resultBytes,
      version, ecLevel.bits);
    //return DecodedBitStreamParserOld.decode(resultBytes, version, ecLevel);
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.BitArray');

goog.scope(function() {
/**
   * <p>A simple, fast array of bits, represented compactly by an array of ints
   * internally.</p>
   * @param {number=} opt_size size, defaults to 0.
   * @constructor
   * @author Sean Owen
   */
  w69b.qr.BitArray = function(opt_size) {
    /**
     * @private
     * @type {number}
     */
    this.size_ = opt_size || 0;
    /**
     * @type {Int32Array} bits.
     * @private
     */
    this.bits_ = w69b.qr.BitArray.makeArray(this.size_);
  };
  var _ = w69b.qr.BitArray;
  var pro = _.prototype;

  _.numberOfTrailingZeros = function(i) {
    // HD, Figure 5-14
    var y;
    if (i == 0) return 32;
    var n = 31;
    y = i << 16; if (y != 0) { n = n - 16; i = y; }
    y = i << 8; if (y != 0) { n = n - 8; i = y; }
    y = i << 4; if (y != 0) { n = n - 4; i = y; }
    y = i << 2; if (y != 0) { n = n - 2; i = y; }
    return n - ((i << 1) >>> 31);
  };

  pro.getSize = function() {
    return this.size_;
  };

  pro.getSizeInBytes = function() {
    return (this.size_ + 7) >> 3;
  };

  pro.ensureCapacity = function(size) {
    if (size > this.bits_.length << 5) {
      var newBits = _.makeArray(size);
      newBits.set(this.bits_, 0);
      this.bits_ = newBits;
    }
  };

  /**
   * @param {number} i bit to get.
   * @return {boolean} true iff bit i is set.
   */
  pro.get = function(i) {
    return (this.bits_[i >> 5] & (1 << (i & 0x1F))) != 0;
  };

  /**
   * Sets bit i.
   * @param {number} i bit to set.
   */
  pro.set = function(i) {
    this.bits_[i >> 5] |= 1 << (i & 0x1F);
  };

  /**
   * Flips bit i.
   *
   * @param {number} i bit to set.
   */
  pro.flip = function(i) {
    this.bits_[i >> 5] ^= 1 << (i & 0x1F);
  };

  /**
   * @param {number} from first bit to check.
   * @return {number} index of first bit that is set, starting from the given
   * index, or size if none are set at or beyond this given index.
   * @see #getNextUnset(int)
   */
  pro.getNextSet = function(from) {
    var size = this.size_;
    if (from >= size) {
      return size;
    }
    var bitsOffset = from >> 5;
    var currentBits = this.bits_[bitsOffset];
    // mask off lesser bits first
    currentBits &= ~((1 << (from & 0x1F)) - 1);
    while (currentBits == 0) {
      if (++bitsOffset == this.bits_.length) {
        return size;
      }
      currentBits = this.bits_[bitsOffset];
    }
    var result = (bitsOffset << 5) + _.numberOfTrailingZeros(currentBits);
    return result > size ? size : result;
  };

  /**
   * @see #getNextSet(int)
   */
  pro.getNextUnset = function(from) {
    var size = this.size_;
    if (from >= size) {
      return size;
    }
    var bitsOffset = from >> 5;
    var currentBits = ~this.bits_[bitsOffset];
    // mask off lesser bits first
    currentBits &= ~((1 << (from & 0x1F)) - 1);
    while (currentBits == 0) {
      if (++bitsOffset == this.bits_.length) {
        return size;
      }
      currentBits = ~this.bits_[bitsOffset];
    }
    var result = (bitsOffset << 5) + _.numberOfTrailingZeros(currentBits);
    return result > size ? size : result;
  };

  /**
   * Sets a block of 32 bits, starting at bit i.
   *
   * @param {number} i first bit to set.
   * @param {number} newBits the new value of the next 32 bits. Note again that
   * the least-significant bit corresponds to bit i, the next-least-significant
   * to i+1, and so on.
   */
  pro.setBulk = function(i, newBits) {
    this.bits_[i >> 5] = newBits;
  };

  /**
   * Sets a range of bits.
   *
   * @param {number} start start of range, inclusive.
   * @param {number} end end of range, exclusive.
   */
  pro.setRange = function(start, end) {
    if (end < start) {
      throw new Error();
    }
    if (end == start) {
      return;
    }
    // will be easier to treat this as the last actually set bit -- inclusive
    end--;
    var firstInt = start >> 5;
    var lastInt = end >> 5;
    for (var i = firstInt; i <= lastInt; i++) {
      var firstBit = i > firstInt ? 0 : start & 0x1F;
      var lastBit = i < lastInt ? 31 : end & 0x1F;
      var mask;
      if (firstBit == 0 && lastBit == 31) {
        mask = -1;
      } else {
        mask = 0;
        for (var j = firstBit; j <= lastBit; j++) {
          mask |= 1 << j;
        }
      }
      this.bits_[i] |= mask;
    }
  };

  /**
   * Clears all bits (sets to false).
   */
  pro.clear = function() {
    var max = this.bits_.length;
    for (var i = 0; i < max; i++) {
      this.bits_[i] = 0;
    }
  };

  /**
   * Efficient method to check if a range of bits is set, or not set.
   *
   * @param {number} start start of range, inclusive.
   * @param {number} end end of range, exclusive.
   * @param {boolean} value if true, checks that bits in range are set,
   * otherwise checks that they are not set.
   * @return {boolean} true iff all bits are set or not set in range, according
   * to value argument.
   */
  pro.isRange = function(start, end, value) {
    if (end < start) {
      throw new Error();
    }
    if (end == start) {
      return true; // empty range matches
    }
    // will be easier to treat this as the last actually set bit -- inclusive
    end--;
    var firstInt = start >> 5;
    var lastInt = end >> 5;
    for (var i = firstInt; i <= lastInt; i++) {
      var firstBit = i > firstInt ? 0 : start & 0x1F;
      var lastBit = i < lastInt ? 31 : end & 0x1F;
      var mask;
      if (firstBit == 0 && lastBit == 31) {
        mask = -1;
      } else {
        mask = 0;
        for (var j = firstBit; j <= lastBit; j++) {
          mask |= 1 << j;
        }
      }

      // Return false if we're looking for 1s and the masked bits[i] isn't all
      // 1s (that is, equals the mask, or we're looking for 0s and the masked
      // portion is not all 0s
      if ((this.bits_[i] & mask) != (value ? mask : 0)) {
        return false;
      }
    }
    return true;
  };

  pro.appendBit = function(bit) {
    this.ensureCapacity(this.size_ + 1);
    if (bit) {
      this.bits_[this.size_ >> 5] |= 1 << (this.size_ & 0x1F);
    }
    this.size_++;
  };

  /**
   * Appends the least-significant this.bits_, from value, in order from
   * most-significant to least-significant. For example, appending 6 this.bits_
   * from 0x000001E will append the this.bits_ 0, 1, 1, 1, 1, 0 in that order.
   */
  pro.appendBits = function(value, numBits) {
    if (numBits < 0 || numBits > 32) {
      throw new Error();
    }
    this.ensureCapacity(this.size_ + numBits);
    for (var numBitsLeft = numBits; numBitsLeft > 0; numBitsLeft--) {
      this.appendBit(((value >> (numBitsLeft - 1)) & 0x01) == 1);
    }
  };

  pro.appendBitArray = function(other) {
    var otherSize = other.size_;
    this.ensureCapacity(this.size_ + otherSize);
    for (var i = 0; i < otherSize; i++) {
      this.appendBit(other.get(i));
    }
  };

  /**
   * @param {w69b.qr.BitArray} other other.
   */
  pro.xor = function(other) {
    if (this.bits_.length != other.bits_.length) {
      throw new Error();
    }
    for (var i = 0; i < this.bits_.length; i++) {
      // The last byte could be incomplete (i.e. not have 8 this.bits_ in
      // it) but there is no problem since 0 XOR 0 == 0.
      this.bits_[i] ^= other.bits_[i];
    }
  };

  /**
   *
   * @param {number} bitOffset first bit to start writing.
   * @param {Array} array array to write varo. Bytes are written
   * most-significant byte first. This is the opposite of the varernal
   * representation, which is * exposed by {@link #getBitArray()}.
   * @param {number} offset position in array to start writing.
   * @param {number} numBytes how many bytes to write.
   */
  pro.toBytes = function(bitOffset, array, offset, numBytes) {
    for (var i = 0; i < numBytes; i++) {
      var theByte = 0;
      for (var j = 0; j < 8; j++) {
        if (this.get(bitOffset)) {
          theByte |= 1 << (7 - j);
        }
        bitOffset++;
      }
      array[offset + i] = theByte;
    }
  };

  /**
   * @return {Int32Array} array of vars. The first element holds the first 32
   * bits, and the least significant bit is bit 0.
   */
  pro.getBitArray = function() {
    return this.bits_;
  };

  /**
   * Reverses all bits in the array.
   */
  pro.reverse = function() {
    var newBits = new Int32Array(this.bits_.length);
    var size = this.size_;
    for (var i = 0; i < size; i++) {
      if (this.get(size - i - 1)) {
        newBits[i >> 5] |= 1 << (i & 0x1F);
      }
    }
    this.bits_ = newBits;
  };

  _.makeArray = function(size) {
    return new Int32Array((size + 31) >> 5);
  };

  pro.toString = function() {
    var result = [];
    for (var i = 0; i < this.size_; i++) {
      if ((i & 0x07) == 0) {
        result.push(' ');
      }
      result.push(this.get(i) ? 'X' : '.');
    }
    return result.join('');
  };

});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('w69b.qr.EncodeHintType');

/**
 * Encode hint key constants.
 * @enum {number}
 */
w69b.qr.EncodeHintType = {
  CHARACTER_SET: 1,
  FORCE_ADD_ECI: 2
};

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.ReedSolomonEncoder');
goog.require('w69b.qr.GF256');
goog.require('w69b.qr.GF256Poly');

goog.scope(function() {
  var GF256 = w69b.qr.GF256;
  var GF256Poly = w69b.qr.GF256Poly;

  /**
   * <p>Implements Reed-Solomon enbcoding, as the name implies.</p>
   *
   * @author Sean Owen
   * @author William Rucklidge
   * @author mb@w69b.com (Mahuel Braun) ported to js.
   */

  /**
   *
   * @param {!GF256} field to use.
   * @constructor
   */
  w69b.qr.ReedSolomonEncoder = function(field) {
    /**
     * @private
     * @type {!GF256}
     */
    this.field_ = field;
    /**
     * @private
     * @type {Array.<!GF256Poly>}
     */
    this.cachedGenerators_ = [new GF256Poly(field, [1])];
  };
  var pro = w69b.qr.ReedSolomonEncoder.prototype;

  /**
   * @param {number} degree degree.
   * @return {!GF256Poly} generator.
   */
  pro.buildGenerator = function(degree) {
    var cachedGenerators = this.cachedGenerators_;
    if (degree >= cachedGenerators.length) {
      var lastGenerator = cachedGenerators[cachedGenerators.length - 1];
      for (var d = cachedGenerators.length; d <= degree; d++) {
        var nextGenerator = lastGenerator.multiply1(
          new GF256Poly(this.field_, [1, this.field_.exp(d - 1)]));
        cachedGenerators.push(nextGenerator);
        lastGenerator = nextGenerator;
      }
    }
    return cachedGenerators[degree];
  };

  /**
   * @param {Array.<number>} toEncode data to encode, including pre-allocated
   * space for ecc bytes.
   * @param {number} ecBytes number of ec bytes.
   */
  pro.encode = function(toEncode, ecBytes) {
    if (ecBytes == 0) {
      throw new Error('No error correction bytes');
    }
    var dataBytes = toEncode.length - ecBytes;
    if (dataBytes <= 0) {
      throw new Error('No data bytes provided');
    }
    var generator = this.buildGenerator(ecBytes);
    var infoCoefficients = toEncode.slice(0, dataBytes);
    var info = new GF256Poly(this.field_, infoCoefficients);
    info = info.multiplyByMonomial(ecBytes, 1);
    var remainder = info.divide(generator)[1];
    var coefficients = remainder.coefficients;
    var numZeroCoefficients = ecBytes - coefficients.length;
    var i;
    for (i = 0; i < numZeroCoefficients; i++) {
      toEncode[dataBytes + i] = 0;
    }
    for (i = 0; i < coefficients.length; ++i) {
      toEncode[dataBytes + numZeroCoefficients + i] = coefficients[i];
    }
    // System.arraycopy(coefficients, 0, toEncode,
    //   dataBytes + numZeroCoefficients, coefficients.length);
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.encoder.BlockPair');

goog.scope(function() {
  /**
   * @constructor
   */
  w69b.qr.encoder.BlockPair = function(data, errorCorrection) {
    this.dataBytes = data;
    this.errorCorrectionBytes = errorCorrection;
  };
  var pro = w69b.qr.encoder.BlockPair.prototype;

  pro.getDataBytes = function() {
    return this.dataBytes;
  };

  pro.getErrorCorrectionBytes = function() {
    return this.errorCorrectionBytes;
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.encoder.ByteMatrix');

/**
 * A class which wraps a 2D array of bytes. The default usage is signed.
 * If you want to use it as a
 * unsigned container, it's up to you to do byteValue & 0xff at each location.
 *
 * JAVAPORT: The original code was a 2D array of ints, but since it only ever
 * gets assigned
 * -1, 0, and 1, I'm going to use less memory and go with bytes.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * @author mb@w69b.com (Manuel Braun) - ported to js.
 */
goog.scope(function() {

  /**
   * Row (y) first byte matrix.
   * @param {number} width with.
   * @param {number} height height.
   * @constructor
   */
  w69b.qr.encoder.ByteMatrix = function(width, height) {
    /**
     * @type {number}
     * @private
     */
    this.width_ = width;
    /**
     * @type {number}
     * @private
     */
    this.height_ = height;
    this.bytes_ = new Int8Array(width * height);
  };
  var pro = w69b.qr.encoder.ByteMatrix.prototype;

  pro.getBytes = function() {
    return this.bytes_;
  };

  pro.getHeight = function() {
    return this.height_;
  };

  pro.getWidth = function() {
    return this.width_;
  };

  pro.get = function(x, y) {
    return this.bytes_[this.width_ * y + x];
  };

  pro.set = function(x, y, value) {
    this.bytes_[this.width_ * y + x] = value;
  };

  pro.clear = function(value) {
    for (var i = 0; i < this.bytes_.length; ++i)
      this.bytes_[i] = value;
  };

  pro.toString = function() {
    var result = [];
    for (var y = 0; y < this.height_; ++y) {
      for (var x = 0; x < this.width_; ++x) {
        switch (this.get(x, y)) {
          case 0:
            result.push(' 0');
            break;
          case 1:
            result.push(' 1');
            break;
          default:
            result.push('  ');
            break;
        }
      }
      result.push('\n');
    }
    return result.join('');
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.encoder.MaskUtil');
goog.require('w69b.qr.encoder.ByteMatrix');

goog.scope(function() {
  var ByteMatrix = w69b.qr.encoder.ByteMatrix;

/**
 * @author Satoru Takabayashi
 * @author Daniel Switkin
 * @author Sean Owen
 * @author mb@69b.com (Manuel Braun) ported to js
 */
var _ = w69b.qr.encoder.MaskUtil;

  // Penalty weights from section 6.8.2.1
  _.N1 = 3;
  _.N2 = 3;
  _.N3 = 40;
  _.N4 = 10;

  /**
   * Apply mask penalty rule 1 and return the penalty.
   * Find repetitive cells with the same color and
   * give penalty to them. Example: 00000 or 11111.
   * @param {ByteMatrix} matrix working matrix.
   * @return {number} result.
   */
  _.applyMaskPenaltyRule1 = function(matrix) {
    return _.applyMaskPenaltyRule1Internal(matrix, true) +
      _.applyMaskPenaltyRule1Internal(matrix, false);
  };

  /**
   * Apply mask penalty rule 2 and return the penalty.
   * Find 2x2 blocks with the same color and give
   * penalty to them. This is actually equivalent to the spec's rule,
   * which is to find MxN blocks and give a
   * penalty proportional to (M-1)x(N-1), because this is the number of
   * 2x2 blocks inside such a block.
   * @param {ByteMatrix} matrix working matrix.
   * @return {number} result.
   */
  _.applyMaskPenaltyRule2 = function(matrix) {
    var penalty = 0;
    var width = matrix.getWidth();
    var height = matrix.getHeight();
    for (var y = 0; y < height - 1; y++) {
      for (var x = 0; x < width - 1; x++) {
        var value = matrix.get(x, y);
        if (value == matrix.get(x + 1, y) && value == matrix.get(x, y + 1) &&
          value == matrix.get(x + 1, y + 1)) {
          penalty++;
        }
      }
    }
    return _.N2 * penalty;
  };

  /**
   * Apply mask penalty rule 3 and return the penalty. Find consecutive
   * cells of 00001011101 or
   * 10111010000, and give penalty to them.
   * If we find patterns like 000010111010000, we give
   * penalties twice (i.e. 40 * 2).
   * @param {ByteMatrix} matrix working matrix.
   * @return {number} result.
   */
  _.applyMaskPenaltyRule3 = function(matrix) {
    var penalty = 0;
    var width = matrix.getWidth();
    var height = matrix.getHeight();
    var bytes = matrix.getBytes();
    for (var y = 0; y < height; y++) {
      var yOffset = width * y;
      for (var x = 0; x < width; x++) {
        // Tried to simplify following conditions but failed.
        if (x + 6 < width &&
            bytes[yOffset + x] == 1 &&
            bytes[yOffset + x + 1] == 0 &&
            bytes[yOffset + x + 2] == 1 &&
            bytes[yOffset + x + 3] == 1 &&
            bytes[yOffset + x + 4] == 1 &&
            bytes[yOffset + x + 5] == 0 &&
            bytes[yOffset + x + 6] == 1 &&
            ((x + 10 < width &&
                bytes[yOffset + x + 7] == 0 &&
                bytes[yOffset + x + 8] == 0 &&
                bytes[yOffset + x + 9] == 0 &&
                bytes[yOffset + x + 10] == 0) ||
             (x - 4 >= 0 &&
                bytes[yOffset + x - 1] == 0 &&
                bytes[yOffset + x - 2] == 0 &&
                bytes[yOffset + x - 3] == 0 &&
                bytes[yOffset + x - 4] == 0))) {
          penalty += _.N3;
        }
        if (y + 6 < height &&
            matrix.get(x, y) == 1 &&
            matrix.get(x, y + 1) == 0 &&
            matrix.get(x, y + 2) == 1 &&
            matrix.get(x, y + 3) == 1 &&
            matrix.get(x, y + 4) == 1 &&
            matrix.get(x, y + 5) == 0 &&
            matrix.get(x, y + 6) == 1 &&
            ((y + 10 < height &&
                matrix.get(x, y + 7) == 0 &&
                matrix.get(x, y + 8) == 0 &&
                matrix.get(x, y + 9) == 0 &&
                matrix.get(x, y + 10) == 0) ||
             (y - 4 >= 0 &&
                matrix.get(x, y - 1) == 0 &&
                matrix.get(x, y - 2) == 0 &&
                matrix.get(x, y - 3) == 0 &&
                matrix.get(x, y - 4) == 0))) {
          penalty += _.N3;
        }
      }
    }
    return penalty;
  };

  /** Apply mask penalty rule 4 and return the penalty. Calculate the ratio of
   * dark cells and give penalty if the ratio is far from 50%. It gives 10
   * penalty for 5% distance.
   * @param {ByteMatrix} matrix working matrix.
   * @return {number} result.
   */
  _.applyMaskPenaltyRule4 = function(matrix) {
    var numDarkCells = 0;
    var width = matrix.getWidth();
    var height = matrix.getHeight();
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        if (matrix.get(x, y) == 1) {
          numDarkCells++;
        }
      }
    }
    var numTotalCells = matrix.getHeight() * matrix.getWidth();
    var darkRatio = numDarkCells / numTotalCells;
    // * 100.0 / 5.0
    var fivePercentVariances = Math.floor(Math.abs(darkRatio - 0.5) * 20.0);
    return fivePercentVariances * _.N4;
  };

  /**
   * Return the mask bit for "getMaskPattern" at "x" and "y". See 8.8 of
   * JISX0510:2004 for mask
   * pattern conditions.
   * @param {number} maskPattern pattern.
   * @param {number} x pos.
   * @param {number} y pos.
   */
  _.getDataMaskBit = function(maskPattern, x, y) {
    var intermediate;
    var temp;
    switch (maskPattern) {
      case 0:
        intermediate = (y + x) & 0x1;
        break;
      case 1:
        intermediate = y & 0x1;
        break;
      case 2:
        intermediate = x % 3;
        break;
      case 3:
        intermediate = (y + x) % 3;
        break;
      case 4:
        intermediate = ((y >>> 1) + (x / 3)) & 0x1;
        break;
      case 5:
        temp = y * x;
        intermediate = (temp & 0x1) + (temp % 3);
        break;
      case 6:
        temp = y * x;
        intermediate = ((temp & 0x1) + (temp % 3)) & 0x1;
        break;
      case 7:
        temp = y * x;
        intermediate = ((temp % 3) + ((y + x) & 0x1)) & 0x1;
        break;
      default:
        throw new Error('Invalid mask pattern: ' + maskPattern);
    }
    return intermediate == 0;
  };

  /**
   * Helper function for applyMaskPenaltyRule1. We need this for doing this
   * calculation in both vertical and horizontal orders respectively.
   * @param {ByteMatrix} matrix working matrix.
   * @param {boolean} isHorizontal horizontal switch.
   * @return {number} penalty.
   */
  _.applyMaskPenaltyRule1Internal = function(matrix, isHorizontal) {
    var penalty = 0;
    var iLimit = isHorizontal ? matrix.getHeight() : matrix.getWidth();
    var jLimit = isHorizontal ? matrix.getWidth() : matrix.getHeight();
    for (var i = 0; i < iLimit; i++) {
      var numSameBitCells = 0;
      var prevBit = -1;
      for (var j = 0; j < jLimit; j++) {
        var bit = isHorizontal ? matrix.get(j, i) : matrix.get(i, j);
        if (bit == prevBit) {
          numSameBitCells++;
        } else {
          if (numSameBitCells >= 5) {
            penalty += _.N1 + (numSameBitCells - 5);
          }
          numSameBitCells = 1;  // Include the cell itself.
          prevBit = bit;
        }
      }
      if (numSameBitCells > 5) {
        penalty += _.N1 + (numSameBitCells - 5);
      }
    }
    return penalty;
  };

});

// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.WriterError');
goog.require('goog.debug.Error');

goog.scope(function() {
  /**
   * @constructor
   * @param {string=} opt_msg message.
   * @extends {goog.debug.Error}
   */
  w69b.qr.WriterError = function(opt_msg) {
    goog.base(this, opt_msg);
  };
  goog.inherits(w69b.qr.WriterError, goog.debug.Error);

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.encoder.QRCode');
goog.require('w69b.qr.ErrorCorrectionLevel');
goog.require('w69b.qr.Mode');
goog.require('w69b.qr.Version');
goog.require('w69b.qr.encoder.ByteMatrix');

goog.scope(function() {

  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;
  var Mode = w69b.qr.Mode;
  var Version = w69b.qr.Version;
  var ByteMatrix = w69b.qr.encoder.ByteMatrix;

  /**
   * @constructor
   * @author satorux@google.com (Satoru Takabayashi) - creator
   * @author dswitkin@google.com (Daniel Switkin) - ported from C++
   * @author mb@w69b.com (Manuel Braun) - ported to js.
   */
  w69b.qr.encoder.QRCode = function() {
  };
  var _ = w69b.qr.encoder.QRCode;
  var pro = _.prototype;
  /**
   * @type {Mode}
   * @private
   */
  pro.mode_ = null;
  /**
   *
   * @type {ErrorCorrectionLevel}
   * @private
   */
  pro.ecLevel_ = null;
  /**
   *
   * @type {Version}
   * @private
   */
  pro.version_ = null;
  /**
   *
   * @type {number}
   * @private
   */
  pro.maskPattern_ = -1;
  /**
   *
   * @type {ByteMatrix}
   * @private
   */
  pro.matrix_ = null;

  /**
   * @type {number}
   */
  _.NUM_MASK_PATTERNS = 8;


  /**
   * @return {Mode} mode.
   */
  pro.getMode = function() {
    return this.mode_;
  };

  /**
   * @return {ErrorCorrectionLevel} ec level.
   */
  pro.getECLevel = function() {
    return this.ecLevel_;
  };

  /**
   * @return {Version} version.
   */
  pro.getVersion = function() {
    return this.version_;
  };

  /**
   * @return {number} mask pattern.
   */
  pro.getMaskPattern = function() {
    return this.maskPattern_;
  };

  /**
   * @return {ByteMatrix} matrix.
   */
  pro.getMatrix = function() {
    return this.matrix_;
  };


  /**
   * @return {string} debug string.
   */
  pro.toString = function() {
    var result = [];
    result.push('<<\n');
    result.push(' mode: ');
    result.push(this.mode_.toString());
    result.push('\n ecLevel: ');
    result.push(this.ecLevel_.toString());
    result.push('\n version: ');
    result.push(this.version_.toString());
    result.push('\n maskPattern: ');
    result.push(this.maskPattern_);
    if (this.matrix_ == null) {
      result.push('\n matrix: null\n');
    } else {
      result.push('\n matrix:\n');
      result.push(this.matrix_.toString());
    }
    result.push('>>\n');
    return result.join('');
  };

  /**
   * @param {Mode} value mode.
   */
  pro.setMode = function(value) {
    this.mode_ = value;
  };

  /**
   * @param {ErrorCorrectionLevel} value ec level.
   */
  pro.setECLevel = function(value) {
    this.ecLevel_ = value;
  };

  /**
   * @param {Version} version version.
   */
  pro.setVersion = function(version) {
    this.version_ = version;
  };

  /**
   * @param {number} value pattern.
   */
  pro.setMaskPattern = function(value) {
    this.maskPattern_ = value;
  };

  /**
   * @param {ByteMatrix} value matrix.
   */
  pro.setMatrix = function(value) {
    this.matrix_ = value;
  };

  /**
   * @param {number} maskPattern pattern.
   * @return {boolean} weather it is valid.
   */
  _.isValidMaskPattern = function(maskPattern) {
    return maskPattern >= 0 && maskPattern < _.NUM_MASK_PATTERNS;
  };

});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.encoder.MatrixUtil');
goog.require('w69b.qr.BitArray');
goog.require('w69b.qr.ErrorCorrectionLevel');
goog.require('w69b.qr.Version');
goog.require('w69b.qr.WriterError');
goog.require('w69b.qr.encoder.ByteMatrix');
goog.require('w69b.qr.encoder.MaskUtil');
goog.require('w69b.qr.encoder.QRCode');

goog.scope(function() {
  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;
  var BitArray = w69b.qr.BitArray;
  var ByteMatrix = w69b.qr.encoder.ByteMatrix;
  var Version = w69b.qr.Version;
  var WriterError = w69b.qr.WriterError;
  var QRCode = w69b.qr.encoder.QRCode;
  var MaskUtil = w69b.qr.encoder.MaskUtil;


  /**
   * @author satorux@google.com (Satoru Takabayashi) - creator
   * @author dswitkin@google.com (Daniel Switkin) - ported from C++
   * @author mb@w69b.com (Manuel Braun) - ported to js.
   */
  var _ = w69b.qr.encoder.MatrixUtil;

  _.POSITION_DETECTION_PATTERN = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ];

  _.POSITION_ADJUSTMENT_PATTERN = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ];

  // From Appendix E. Table 1, JIS0510X:2004 (p 71). The table was
  // double-checked by komatsu.
  _.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE = [
    [-1, -1, -1, -1, -1, -1, -1],  // Version 1
    [6, 18, -1, -1, -1, -1, -1],  // Version 2
    [6, 22, -1, -1, -1, -1, -1],  // Version 3
    [6, 26, -1, -1, -1, -1, -1],  // Version 4
    [6, 30, -1, -1, -1, -1, -1],  // Version 5
    [6, 34, -1, -1, -1, -1, -1],  // Version 6
    [6, 22, 38, -1, -1, -1, -1],  // Version 7
    [6, 24, 42, -1, -1, -1, -1],  // Version 8
    [6, 26, 46, -1, -1, -1, -1],  // Version 9
    [6, 28, 50, -1, -1, -1, -1],  // Version 10
    [6, 30, 54, -1, -1, -1, -1],  // Version 11
    [6, 32, 58, -1, -1, -1, -1],  // Version 12
    [6, 34, 62, -1, -1, -1, -1],  // Version 13
    [6, 26, 46, 66, -1, -1, -1],  // Version 14
    [6, 26, 48, 70, -1, -1, -1],  // Version 15
    [6, 26, 50, 74, -1, -1, -1],  // Version 16
    [6, 30, 54, 78, -1, -1, -1],  // Version 17
    [6, 30, 56, 82, -1, -1, -1],  // Version 18
    [6, 30, 58, 86, -1, -1, -1],  // Version 19
    [6, 34, 62, 90, -1, -1, -1],  // Version 20
    [6, 28, 50, 72, 94, -1, -1],  // Version 21
    [6, 26, 50, 74, 98, -1, -1],  // Version 22
    [6, 30, 54, 78, 102, -1, -1],  // Version 23
    [6, 28, 54, 80, 106, -1, -1],  // Version 24
    [6, 32, 58, 84, 110, -1, -1],  // Version 25
    [6, 30, 58, 86, 114, -1, -1],  // Version 26
    [6, 34, 62, 90, 118, -1, -1],  // Version 27
    [6, 26, 50, 74, 98, 122, -1],  // Version 28
    [6, 30, 54, 78, 102, 126, -1],  // Version 29
    [6, 26, 52, 78, 104, 130, -1],  // Version 30
    [6, 30, 56, 82, 108, 134, -1],  // Version 31
    [6, 34, 60, 86, 112, 138, -1],  // Version 32
    [6, 30, 58, 86, 114, 142, -1],  // Version 33
    [6, 34, 62, 90, 118, 146, -1],  // Version 34
    [6, 30, 54, 78, 102, 126, 150],  // Version 35
    [6, 24, 50, 76, 102, 128, 154],  // Version 36
    [6, 28, 54, 80, 106, 132, 158],  // Version 37
    [6, 32, 58, 84, 110, 136, 162],  // Version 38
    [6, 26, 54, 82, 110, 138, 166],  // Version 39
    [6, 30, 58, 86, 114, 142, 170]  // Version 40
  ];

  // Type info cells at the left top corner.
  _.TYPE_INFO_COORDINATES = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8]
  ];

  // From Appendix D in JISX0510:2004 (p. 67)
  _.VERSION_INFO_POLY = 0x1f25;  // 1 1111 0010 0101

  // From Appendix C in JISX0510:2004 (p.65).
  _.TYPE_INFO_POLY = 0x537;
  _.TYPE_INFO_MASK_PATTERN = 0x5412;

  // Set all cells to -1.  -1 means that the cell is empty (not set yet).
  //
  // JAVAPORT: We shouldn't need to do this at all. The code should be
  // rewritten to begin encoding with the ByteMatrix initialized all to zero.
  /**
   * @param {ByteMatrix} matrix matrix.
   */
  _.clearMatrix = function(matrix) {
    matrix.clear(-1);
  };

  /**
   * Build 2D matrix of QR Code from "dataBits" with "ecLevel", "version" and
   * "getMaskPattern". On success, store the result in "matrix" .
   * @param {BitArray} dataBits bits.
   * @param {ErrorCorrectionLevel} ecLevel error correction leval.
   * @param {Version} version version.
   * @param {number} maskPattern mask.
   * @param {ByteMatrix} matrix result matrix.
   */
  _.buildMatrix = function(dataBits, ecLevel, version, maskPattern, matrix) {
    _.clearMatrix(matrix);
    _.embedBasicPatterns(version, matrix);
    // Type information appear with any version.
    _.embedTypeInfo(ecLevel, maskPattern, matrix);
    // Version info appear if version >= 7.
    _.maybeEmbedVersionInfo(version, matrix);
    // Data should be embedded at end.
    _.embedDataBits(dataBits, maskPattern, matrix);
  };

  /**
   *
   * Embed basic patterns. On success, modify the matrix and return true.
   * The basic patterns are:
   * - Position detection patterns
   * - Timing patterns
   * - Dark dot at the left bottom corner
   * - Position adjustment patterns, if needed
   * @param {Version} version version.
   * @param {ByteMatrix} matrix result.
   */
  _.embedBasicPatterns = function(version, matrix) {
    // Let's get started with embedding big squares at corners.
    _.embedPositionDetectionPatternsAndSeparators(matrix);
    // Then, embed the dark dot at the left bottom corner.
    _.embedDarkDotAtLeftBottomCorner(matrix);

    // Position adjustment patterns appear if version >= 2.
    _.maybeEmbedPositionAdjustmentPatterns(version, matrix);
    // Timing patterns should be embedded after position adj. patterns.
    _.embedTimingPatterns(matrix);
  };

  /**
   * Embed type information. On success, modify the matrix.
   * @param {ErrorCorrectionLevel} ecLevel error correciton level.
   * @param {number} maskPattern pattern.
   * @param {ByteMatrix} matrix result.
   */
  _.embedTypeInfo = function(ecLevel, maskPattern, matrix) {
    var typeInfoBits = new BitArray();
    _.makeTypeInfoBits(ecLevel, maskPattern, typeInfoBits);

    for (var i = 0; i < typeInfoBits.getSize(); ++i) {
      // Place bits in LSB to MSB order.  LSB (least significant bit) is the
      // last value in "typeInfoBits".
      var bit = typeInfoBits.get(typeInfoBits.getSize() - 1 - i);

      // Type info bits at the left top corner. See 8.9 of JISX0510:2004 (p.46).
      var x1 = _.TYPE_INFO_COORDINATES[i][0];
      var y1 = _.TYPE_INFO_COORDINATES[i][1];
      matrix.set(x1, y1, bit);

      if (i < 8) {
        // Right top corner.
        var x2 = matrix.getWidth() - i - 1;
        var y2 = 8;
        matrix.set(x2, y2, bit);
      } else {
        // Left bottom corner.
        var x2 = 8;
        var y2 = matrix.getHeight() - 7 + (i - 8);
        matrix.set(x2, y2, bit);
      }
    }
  };

  /**
   * Embed version information if need be. On success, modify the matrix.
   * See 8.10 of JISX0510:2004 (p.47) for how to embed version information.
   * @param {Version} version version.
   * @param {ByteMatrix} matrix result.
   */
  _.maybeEmbedVersionInfo = function(version, matrix) {
    // Version info is necessary if version >= 7.
    if (version.getVersionNumber() < 7) {
      return;  // Don't need version info.
    }
    var versionInfoBits = new BitArray();
    _.makeVersionInfoBits(version, versionInfoBits);

    var bitIndex = 6 * 3 - 1;  // It will decrease from 17 to 0.
    for (var i = 0; i < 6; ++i) {
      for (var j = 0; j < 3; ++j) {
        // Place bits in LSB (least significant bit) to MSB order.
        var bit = versionInfoBits.get(bitIndex);
        bitIndex--;
        // Left bottom corner.
        matrix.set(i, matrix.getHeight() - 11 + j, bit);
        // Right bottom corner.
        matrix.set(matrix.getHeight() - 11 + j, i, bit);
      }
    }
  };

  /**
   * Embed "dataBits" using "getMaskPattern". On success, modify the matrix and
   * return true.  For debugging purposes, it skips masking process if
   * "getMaskPattern" is -1.  See 8.7 of JISX0510:2004 (p.38) for how to embed
   * data bits.
   * @param {BitArray} dataBits bits.
   * @param {number} maskPattern mask.
   * @param {ByteMatrix} matrix result..
   */
  _.embedDataBits = function(dataBits, maskPattern, matrix) {
    var bitIndex = 0;
    var direction = -1;
    // Start from the right bottom cell.
    var x = matrix.getWidth() - 1;
    var y = matrix.getHeight() - 1;
    while (x > 0) {
      // Skip the vertical timing pattern.
      if (x == 6) {
        x -= 1;
      }
      while (y >= 0 && y < matrix.getHeight()) {
        for (var i = 0; i < 2; ++i) {
          var xx = x - i;
          // Skip the cell if it's not empty.
          if (!_.isEmpty(matrix.get(xx, y))) {
            continue;
          }
          var bit;
          if (bitIndex < dataBits.getSize()) {
            bit = dataBits.get(bitIndex);
            ++bitIndex;
          } else {
            // Padding bit. If there is no bit left, we'll fill the left cells
            // with 0, as described in 8.4.9 of JISX0510:2004 (p. 24).
            bit = false;
          }

          // Skip masking if mask_pattern is -1.
          if (maskPattern != -1 && MaskUtil.getDataMaskBit(maskPattern, xx,
            y)) {
            bit = !bit;
          }
          matrix.set(xx, y, bit);
        }
        y += direction;
      }
      direction = -direction;  // Reverse the direction.
      y += direction;
      x -= 2;  // Move to the left.
    }
    // All bits should be consumed.
    if (bitIndex != dataBits.getSize()) {
      throw new WriterError('Not all bits consumed: ' +
        bitIndex + '/' + dataBits.getSize());
    }
  };

  /**
   *
   * Return the position of the most significant bit set (to one) in the
   * "value". The most significant bit is position 32. If there is no bit set,
   * return 0. Examples:
   * - findMSBSet(0) => 0
   * - findMSBSet(1) => 1
   * - findMSBSet(255) => 8
   */
  _.findMSBSet = function(value) {
    var numDigits = 0;
    while (value != 0) {
      value >>>= 1;
      ++numDigits;
    }
    return numDigits;
  };

  /**
   *
   * Calculate BCH (Bose-Chaudhuri-Hocquenghem) code for "value" using
   * polynomial "poly". The BCH
   * code is used for encoding type information and version information.
   * Example: Calculation of version information of 7.
   * f(x) is created from 7.
   *   - 7 = 000111 in 6 bits
   *   - f(x) = x^2 + x^1 + x^0
   * g(x) is given by the standard (p. 67)
   *   - g(x) = x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1
   * Multiply f(x) by x^(18 - 6)
   *   - f'(x) = f(x) * x^(18 - 6)
   *   - f'(x) = x^14 + x^13 + x^12
   * Calculate the remainder of f'(x) / g(x)
   *         x^2
   *         __________________________________________________
   *   g(x) )x^14 + x^13 + x^12
   *         x^14 + x^13 + x^12 + x^11 + x^10 + x^7 + x^4 + x^2
   *         --------------------------------------------------
   *                              x^11 + x^10 + x^7 + x^4 + x^2
   *
   * The remainder is x^11 + x^10 + x^7 + x^4 + x^2
   * Encode it in binary: 110010010100
   * The return value is 0xc94 (1100 1001 0100)
   *
   * Since all coefficients in the polynomials are 1 or 0, we can do the
   * calculation by bit
   * operations. We don't care if cofficients are positive or negative.
   * @param {number} value see above.
   * @param {number} poly see above.
   * @return {number} see above.
   */
  _.calculateBCHCode = function(value, poly) {
    // If poly is "1 1111 0010 0101" (version info poly), msbSetInPoly is 13.
    // We'll subtract 1 from 13 to make it 12.
    var msbSetInPoly = _.findMSBSet(poly);
    value <<= msbSetInPoly - 1;
    // Do the division business using exclusive-or operations.
    while (_.findMSBSet(value) >= msbSetInPoly) {
      value ^= poly << (_.findMSBSet(value) - msbSetInPoly);
    }
    // Now the "value" is the remainder (i.e. the BCH code)
    return value;
  };

  /**
   * Make bit vector of type information. On success, store the result in
   * "bits" and return true.  Encode error correction level and mask pattern.
   * See 8.9 of JISX0510:2004 (p.45) for details.
   * @param {ErrorCorrectionLevel} ecLevel error correction level.
   * @param {number} maskPattern pattern.
   * @param {BitArray} bits result array.
   */
  _.makeTypeInfoBits = function(ecLevel, maskPattern, bits) {
    if (!QRCode.isValidMaskPattern(maskPattern)) {
      throw new WriterError('Invalid mask pattern');
    }
    var typeInfo = (ecLevel.getBits() << 3) | maskPattern;
    bits.appendBits(typeInfo, 5);

    var bchCode = _.calculateBCHCode(typeInfo, _.TYPE_INFO_POLY);
    bits.appendBits(bchCode, 10);

    var maskBits = new BitArray();
    maskBits.appendBits(_.TYPE_INFO_MASK_PATTERN, 15);
    bits.xor(maskBits);

    if (bits.getSize() != 15) {  // Just in case.
      throw new WriterError('should not happen but we got: ' +
        bits.getSize());
    }
  };

  /**
   * Make bit vector of version information. On success, store the result in
   * "bits" and return true.  See 8.10 of JISX0510:2004 (p.45) for details.
   * @param {Version} version version.
   * @param {BitArray} bits result array.
   */
  _.makeVersionInfoBits = function(version, bits) {
    bits.appendBits(version.getVersionNumber(), 6);
    var bchCode = _.calculateBCHCode(version.getVersionNumber(),
      _.VERSION_INFO_POLY);
    bits.appendBits(bchCode, 12);

    if (bits.getSize() != 18) {  // Just in case.
      throw new WriterError('should not happen but we got: ' +
        bits.getSize());
    }
  };

  /**
   * @return {boolean} if value is empty.
   */
  _.isEmpty = function(value) {
    return value == -1;
  };

  /**
   * @param {ByteMatrix} matrix matrix to add timing patterns to.
   */
  _.embedTimingPatterns = function(matrix) {
    // -8 is for skipping position detection patterns (size 7), and two
    // horizontal/vertical separation patterns (size 1). Thus, 8 = 7 + 1.
    for (var i = 8; i < matrix.getWidth() - 8; ++i) {
      var bit = (i + 1) % 2;
      // Horizontal line.
      if (_.isEmpty(matrix.get(i, 6))) {
        matrix.set(i, 6, bit);
      }
      // Vertical line.
      if (_.isEmpty(matrix.get(6, i))) {
        matrix.set(6, i, bit);
      }
    }
  };

  /**
   * Embed the lonely dark dot at left bottom corner. JISX0510:2004 (p.46)
   * @param {ByteMatrix} matrix the matrix.
   */
  _.embedDarkDotAtLeftBottomCorner = function(matrix) {
    if (matrix.get(8, matrix.getHeight() - 8) == 0) {
      throw new WriterError();
    }
    matrix.set(8, matrix.getHeight() - 8, 1);
  };

  _.embedHorizontalSeparationPattern = function(xStart, yStart, matrix) {
    for (var x = 0; x < 8; ++x) {
      if (!_.isEmpty(matrix.get(xStart + x, yStart))) {
        throw new WriterError();
      }
      matrix.set(xStart + x, yStart, 0);
    }
  };

  _.embedVerticalSeparationPattern = function(xStart, yStart, matrix) {
    for (var y = 0; y < 7; ++y) {
      if (!_.isEmpty(matrix.get(xStart, yStart + y))) {
        throw new WriterError();
      }
      matrix.set(xStart, yStart + y, 0);
    }
  };

  _.embedPositionAdjustmentPattern = function(xStart, yStart, matrix) {
    for (var y = 0; y < 5; ++y) {
      for (var x = 0; x < 5; ++x) {
        matrix.set(xStart + x, yStart + y,
          _.POSITION_ADJUSTMENT_PATTERN[y][x]);
      }
    }
  };

  _.embedPositionDetectionPattern = function(xStart, yStart, matrix) {
    for (var y = 0; y < 7; ++y) {
      for (var x = 0; x < 7; ++x) {
        matrix.set(xStart + x, yStart + y, _.POSITION_DETECTION_PATTERN[y][x]);
      }
    }
  };

  /**
   * Embed position detection patterns and surrounding vertical/horizontal
   * separators.
   * @param {ByteMatrix} matrix working matrix.
   */
  _.embedPositionDetectionPatternsAndSeparators = function(matrix) {
    // Embed three big squares at corners.
    var pdpWidth = _.POSITION_DETECTION_PATTERN[0].length;
    // Left top corner.
    _.embedPositionDetectionPattern(0, 0, matrix);
    // Right top corner.
    _.embedPositionDetectionPattern(matrix.getWidth() - pdpWidth, 0, matrix);
    // Left bottom corner.
    _.embedPositionDetectionPattern(0, matrix.getWidth() - pdpWidth, matrix);

    // Embed horizontal separation patterns around the squares.
    var hspWidth = 8;
    // Left top corner.
    _.embedHorizontalSeparationPattern(0, hspWidth - 1, matrix);
    // Right top corner.
    _.embedHorizontalSeparationPattern(matrix.getWidth() - hspWidth,
      hspWidth - 1, matrix);
    // Left bottom corner.
    _.embedHorizontalSeparationPattern(0, matrix.getWidth() - hspWidth,
      matrix);

    // Embed vertical separation patterns around the squares.
    var vspSize = 7;
    // Left top corner.
    _.embedVerticalSeparationPattern(vspSize, 0, matrix);
    // Right top corner.
    _.embedVerticalSeparationPattern(matrix.getHeight() - vspSize - 1, 0,
      matrix);
    // Left bottom corner.
    _.embedVerticalSeparationPattern(vspSize, matrix.getHeight() - vspSize,
      matrix);
  };

  /**
   * Embed position adjustment patterns if needed.
   */
  _.maybeEmbedPositionAdjustmentPatterns = function(version, matrix) {
    // The patterns appear if version >= 2
    if (version.getVersionNumber() < 2) {
      return;
    }
    var index = version.getVersionNumber() - 1;
    var coordinates = _.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[index];
    var numCoordinates =
      _.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[index].length;
    for (var i = 0; i < numCoordinates; ++i) {
      for (var j = 0; j < numCoordinates; ++j) {
        var y = coordinates[i];
        var x = coordinates[j];
        if (x == -1 || y == -1) {
          continue;
        }
        // If the cell is unset, we embed the position adjustment pattern here.
        if (_.isEmpty(matrix.get(x, y))) {
          // -2 is necessary since the x/y coordinates point to the center of
          // the pattern, not the
          // left top corner.
          _.embedPositionAdjustmentPattern(x - 2, y - 2, matrix);
        }
      }
    }
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.encoder.Encoder');
goog.require('w69b.qr.BitArray');
goog.require('w69b.qr.CharacterSetECI');
goog.require('w69b.qr.EncodeHintType');
goog.require('w69b.qr.ErrorCorrectionLevel');
goog.require('w69b.qr.GF256');
goog.require('w69b.qr.Mode');
goog.require('w69b.qr.ModeEnum');
goog.require('w69b.qr.ReedSolomonEncoder');
goog.require('w69b.qr.Version');
goog.require('w69b.qr.encoder.BlockPair');
goog.require('w69b.qr.encoder.MaskUtil');
goog.require('w69b.qr.encoder.MatrixUtil');
goog.require('w69b.qr.encoder.QRCode');
goog.require('w69b.qr.stringutils');

goog.scope(function() {
  var ErrorCorrectionLevel = w69b.qr.ErrorCorrectionLevel;
  var BitArray = w69b.qr.BitArray;
  var ByteMatrix = w69b.qr.encoder.ByteMatrix;
  var MatrixUtil = w69b.qr.encoder.MatrixUtil;
  var Version = w69b.qr.Version;
  var WriterError = w69b.qr.WriterError;
  var BlockPair = w69b.qr.encoder.BlockPair;
  var QRCode = w69b.qr.encoder.QRCode;
  var MaskUtil = w69b.qr.encoder.MaskUtil;
  var Mode = w69b.qr.Mode;
  var ModeEnum = w69b.qr.ModeEnum;
  var EncodeHintType = w69b.qr.EncodeHintType;
  var CharacterSetECI = w69b.qr.CharacterSetECI;
  var ReedSolomonEncoder = w69b.qr.ReedSolomonEncoder;
  var stringutils = w69b.qr.stringutils;


  /**
   * @author satorux@google.com (Satoru Takabayashi) - creator
   * @author dswitkin@google.com (Daniel Switkin) - ported from C+
   * @author mb@w69b.com (Manuel Braun) - ported to js
   */
  var _ = w69b.qr.encoder.Encoder;

  // The original table is defined in the table 5 of JISX0510:2004 (p.19).
  _.ALPHANUMERIC_TABLE = [
    // 0x00-0x0f
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    // 0x10-0x1f
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    // 0x20-0x2f
    36, -1, -1, -1, 37, 38, -1, -1, -1, -1, 39, 40, -1, 41, 42, 43,
    // 0x30-0x3f
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 44, -1, -1, -1, -1, -1,
    // 0x40-0x4f
    -1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    // 0x50-0x5f
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, -1, -1, -1, -1, -1
  ];

  _.DEFAULT_BYTE_MODE_ENCODING = 'UTF-8';

  /** The mask penalty calculation is complicated.  See Table 21 of
   * JISX0510:2004 (p.45) for details.  Basically it applies four rules and
   * summate all penalties.
   */
  _.calculateMaskPenalty = function(matrix) {
    return MaskUtil.applyMaskPenaltyRule1(matrix) +
      MaskUtil.applyMaskPenaltyRule2(matrix) +
      MaskUtil.applyMaskPenaltyRule3(matrix) +
      MaskUtil.applyMaskPenaltyRule4(matrix);
  };

  /**
   *  Encode "bytes" with the error correction level "ecLevel". The encoding
   *  mode will be chosen internally by chooseMode(). On success, store the
   *  result in "qrCode".
   *
   * We recommend you to use QRCode.EC_LEVEL_L (the lowest level) for
   * "getECLevel" since our primary use is to show QR code on desktop screens.
   * We don't need very strong error correction for this purpose.
   *
   * Note that there is no way to encode bytes in MODE_KANJI. We might want to
   * add EncodeWithMode() with which clients can specify the encoding mode. For
   * now, we don't need the functionality.
   *
   * @param {string} content string.
   * @param {ErrorCorrectionLevel} ecLevel error correction level.
   * @param {Object=} opt_hints encoding hints.
   *
   */

  _.encode = function(content, ecLevel, opt_hints) {

    // Determine what character encoding has been specified by the caller, if
    // any
    var encoding = opt_hints ? opt_hints[EncodeHintType.CHARACTER_SET] : null;
    var forceECI = opt_hints ? opt_hints[EncodeHintType.FORCE_ADD_ECI] : false;
    if (encoding == null) {
      encoding = _.DEFAULT_BYTE_MODE_ENCODING;
    }

    // Pick an encoding mode appropriate for the content. Note that this will
    // not attempt to use multiple modes / segments even if that were more
    // efficient. Twould be nice.
    var mode = _.chooseMode(content, encoding);

    // This will store the header information, like mode and
    // length, as well as "header" segments like an ECI segment.
    var headerBits = new BitArray();

    // Append ECI segment if applicable
    // Disabled in compat mode as some scanners seem to have problems with it.
    if (forceECI ||
      (mode == ModeEnum.BYTE && _.DEFAULT_BYTE_MODE_ENCODING != encoding)) {
      var eci = CharacterSetECI.getValue(encoding);
      if (eci) {
        _.appendECI(eci, headerBits);
      }
    }

    // (With ECI in place,) Write the mode marker
    _.appendModeInfo(mode, headerBits);

    // Collect data within the main segment, separately, to count its size if
    // needed. Don't add it to main payload yet.
    var dataBits = new BitArray();
    _.appendBytes(content, mode, dataBits, encoding);

    // Hard part: need to know version to know how many bits length takes. But
    // need to know how many bits it takes to know version. First we take a
    // guess at version by assuming version will be the minimum, 1:

    var provisionalBitsNeeded = headerBits.getSize() +
      mode.getCharacterCountBits(Version.getVersionForNumber(1)) +
      dataBits.getSize();
    var provisionalVersion = _.chooseVersion(provisionalBitsNeeded, ecLevel);

    // Use that guess to calculate the right version. I am still not sure this
    // works in 100% of cases.

    var bitsNeeded = headerBits.getSize() +
      mode.getCharacterCountBits(provisionalVersion) +
      dataBits.getSize();
    var version = _.chooseVersion(bitsNeeded, ecLevel);

    var headerAndDataBits = new BitArray();
    headerAndDataBits.appendBitArray(headerBits);
    // Find "length" of main segment and write it
    var numLetters =
      (mode == ModeEnum.BYTE ? dataBits.getSizeInBytes() : content.length);
    _.appendLengthInfo(numLetters, version, mode, headerAndDataBits);
    // Put data together into the overall payload
    headerAndDataBits.appendBitArray(dataBits);

    var ecBlocks = version.getECBlocksForLevel(ecLevel);
    var numDataBytes = version.getTotalCodewords() -
      ecBlocks.getTotalECCodewords();

    // Terminate the bits properly.
    _.terminateBits(numDataBytes, headerAndDataBits);

    // Interleave data bits with error correction code.
    var finalBits = _.interleaveWithECBytes(headerAndDataBits,
      version.getTotalCodewords(),
      numDataBytes,
      ecBlocks.getNumBlocks());

    var qrCode = new QRCode();

    qrCode.setECLevel(ecLevel);
    qrCode.setMode(mode);
    qrCode.setVersion(version);

    //  Choose the mask pattern and set to "qrCode".
    var dimension = version.getDimensionForVersion();
    var matrix = new ByteMatrix(dimension, dimension);
    var maskPattern = _.chooseMaskPattern(finalBits, ecLevel, version, matrix);
    qrCode.setMaskPattern(maskPattern);

    // Build the matrix and set it to "qrCode".
    MatrixUtil.buildMatrix(finalBits, ecLevel, version, maskPattern, matrix);
    qrCode.setMatrix(matrix);

    return qrCode;
  };

  /**
   * @param {number} code ascii code.
   * @return {number} the code point of the table used in alphanumeric mode or
   *  -1 if there is no corresponding code in the table.
   */
  _.getAlphanumericCode = function(code) {
    code = Number(code);
    if (code < _.ALPHANUMERIC_TABLE.length) {
      return _.ALPHANUMERIC_TABLE[code];
    }
    return -1;
  };


  /**
   * Choose the best mode by examining the content. Note that 'encoding' is
   * used as a hint;
   * if it is Shift_JIS, and the input is only double-byte Kanji, then we
   * return {@link Mode#KANJI}.
   * @param {string} content to encode.
   * @param {string=} opt_encoding optional encoding..
   */
  _.chooseMode = function(content, opt_encoding) {
    if ('SHIFT_JIS' == opt_encoding) {
      // Choose Kanji mode if all input are double-byte characters
      return _.isOnlyDoubleByteKanji(content) ? ModeEnum.KANJI : ModeEnum.BYTE;
    }
    var hasNumeric = false;
    var hasAlphanumeric = false;
    var zeroChar = '0'.charCodeAt(0);
    var nineChar = '9'.charCodeAt(0);
    for (var i = 0; i < content.length; ++i) {
      var c = content.charCodeAt(i);
      if (c >= zeroChar && c <= nineChar) {
        hasNumeric = true;
      } else if (_.getAlphanumericCode(c) != -1) {
        hasAlphanumeric = true;
      } else {
        return ModeEnum.BYTE;
      }
    }
    if (hasAlphanumeric) {
      return ModeEnum.ALPHANUMERIC;
    }
    if (hasNumeric) {
      return ModeEnum.NUMERIC;
    }
    return ModeEnum.BYTE;
  };

  _.isOnlyDoubleByteKanji = function(content) {
    var bytes = [];
    try {
      bytes = stringutils.stringToBytes(content, 'SHIFT_JIS');
    } catch (uee) {
      return false;
    }
    var length = bytes.length;
    if (length % 2 != 0) {
      return false;
    }
    for (var i = 0; i < length; i += 2) {
      var byte1 = bytes[i] & 0xFF;
      if ((byte1 < 0x81 || byte1 > 0x9F) && (byte1 < 0xE0 || byte1 > 0xEB)) {
        return false;
      }
    }
    return true;
  };

  _.chooseMaskPattern = function(bits, ecLevel, version, matrix) {

    var minPenalty = Number.MAX_VALUE;  // Lower penalty is better.
    var bestMaskPattern = -1;
    // We try all mask patterns to choose the best one.
    for (var maskPattern = 0; maskPattern < QRCode.NUM_MASK_PATTERNS;
         maskPattern++) {
      MatrixUtil.buildMatrix(bits, ecLevel, version, maskPattern, matrix);
      var penalty = _.calculateMaskPenalty(matrix);
      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestMaskPattern = maskPattern;
      }
    }
    return bestMaskPattern;
  };

  _.chooseVersion = function(numInputBits, ecLevel) {
    // In the following comments, we use numbers of Version 7-H.
    for (var versionNum = 1; versionNum <= 40; versionNum++) {
      var version = Version.getVersionForNumber(versionNum);
      // numBytes = 196
      var numBytes = version.getTotalCodewords();
      // getNumECBytes = 130
      var ecBlocks = version.getECBlocksForLevel(ecLevel);
      var numEcBytes = ecBlocks.getTotalECCodewords();
      // getNumDataBytes = 196 - 130 = 66
      var numDataBytes = numBytes - numEcBytes;
      var totalInputBytes = Math.floor((numInputBits + 7) / 8);
      if (numDataBytes >= totalInputBytes) {
        return version;
      }
    }
    throw new WriterError('Data too big');
  };

  /**
   * Terminate bits as described in 8.4.8 and 8.4.9 of JISX0510:2004 (p.24).
   */
  _.terminateBits = function(numDataBytes, bits) {
    var i;
    var capacity = numDataBytes << 3;
    if (bits.getSize() > capacity) {
      throw new WriterError('data bits cannot fit in the QR Code' +
        bits.getSize() + ' > ' + capacity);
    }
    for (i = 0; i < 4 && bits.getSize() < capacity; ++i) {
      bits.appendBit(false);
    }
    // Append termination bits. See 8.4.8 of JISX0510:2004 (p.24) for details.
    // If the last byte isn't 8-bit aligned, we'll add padding bits.
    var numBitsInLastByte = bits.getSize() & 0x07;
    if (numBitsInLastByte > 0) {
      for (i = numBitsInLastByte; i < 8; i++) {
        bits.appendBit(false);
      }
    }
    // If we have more space, we'll fill the space with padding patterns
    // defined in 8.4.9 (p.24).
    var numPaddingBytes = numDataBytes - bits.getSizeInBytes();
    for (i = 0; i < numPaddingBytes; ++i) {
      bits.appendBits((i & 0x01) == 0 ? 0xEC : 0x11, 8);
    }
    if (bits.getSize() != capacity) {
      throw new WriterError('Bits size does not equal capacity');
    }
  };

  /** Get number of data bytes and number of error correction bytes for block
   * id "blockID". Store the result in "numDataBytesInBlock", and
   * "numECBytesInBlock". See table 12 in 8.5.1 of JISX0510:2004 (p.30)
   */
  _.getNumDataBytesAndNumECBytesForBlockID = function(numTotalBytes,
                                                      numDataBytes,
                                                      numRSBlocks, blockID,
                                                      numDataBytesInBlock,
                                                      numECBytesInBlock) {
    if (blockID >= numRSBlocks) {
      throw new WriterError('Block ID too large');
    }
    // numRsBlocksInGroup2 = 196 % 5 = 1
    var numRsBlocksInGroup2 = numTotalBytes % numRSBlocks;
    // numRsBlocksInGroup1 = 5 - 1 = 4
    var numRsBlocksInGroup1 = numRSBlocks - numRsBlocksInGroup2;
    // numTotalBytesInGroup1 = 196 / 5 = 39
    var numTotalBytesInGroup1 = Math.floor(numTotalBytes / numRSBlocks);
    // numTotalBytesInGroup2 = 39 + 1 = 40
    var numTotalBytesInGroup2 = numTotalBytesInGroup1 + 1;
    // numDataBytesInGroup1 = 66 / 5 = 13
    var numDataBytesInGroup1 = Math.floor(numDataBytes / numRSBlocks);
    // numDataBytesInGroup2 = 13 + 1 = 14
    var numDataBytesInGroup2 = numDataBytesInGroup1 + 1;
    // numEcBytesInGroup1 = 39 - 13 = 26
    var numEcBytesInGroup1 = numTotalBytesInGroup1 - numDataBytesInGroup1;
    // numEcBytesInGroup2 = 40 - 14 = 26
    var numEcBytesInGroup2 = numTotalBytesInGroup2 - numDataBytesInGroup2;
    // Sanity checks.
    // 26 = 26
    if (numEcBytesInGroup1 != numEcBytesInGroup2) {
      throw new WriterError('EC bytes mismatch');
    }
    // 5 = 4 + 1.
    if (numRSBlocks != numRsBlocksInGroup1 + numRsBlocksInGroup2) {
      throw new WriterError('RS blocks mismatch');
    }
    // 196 = (13 + 26) * 4 + (14 + 26) * 1
    if (numTotalBytes !=
      ((numDataBytesInGroup1 + numEcBytesInGroup1) *
        numRsBlocksInGroup1) +
        ((numDataBytesInGroup2 + numEcBytesInGroup2) *
          numRsBlocksInGroup2)) {
      throw new WriterError('Total bytes mismatch');
    }

    if (blockID < numRsBlocksInGroup1) {
      numDataBytesInBlock[0] = numDataBytesInGroup1;
      numECBytesInBlock[0] = numEcBytesInGroup1;
    } else {
      numDataBytesInBlock[0] = numDataBytesInGroup2;
      numECBytesInBlock[0] = numEcBytesInGroup2;
    }
  };

  /**
   * Interleave "bits" with corresponding error correction bytes. On success,
   * store the result in "result". The interleave rule is complicated. See 8.6
   * of JISX0510:2004 (p.37) for details.
   */
  _.interleaveWithECBytes = function(bits, numTotalBytes, numDataBytes,
                                     numRSBlocks) {

    // "bits" must have "getNumDataBytes" bytes of data.
    if (bits.getSizeInBytes() != numDataBytes) {
      throw new WriterError('Number of bits and data bytes does not match');
    }

    // Step 1.  Divide data bytes into blocks and generate error correction
    // bytes for them. We'll store the divided data bytes blocks and error
    // correction bytes blocks into "blocks".
    var dataBytesOffset = 0;
    var maxNumDataBytes = 0;
    var maxNumEcBytes = 0;

    // Since, we know the number of reedsolmon blocks, we can initialize the
    // vector with the number.
    var blocks = [];
    var i;

    for (i = 0; i < numRSBlocks; ++i) {
      var numDataBytesInBlock = [0];
      var numEcBytesInBlock = [0];
      _.getNumDataBytesAndNumECBytesForBlockID(
        numTotalBytes, numDataBytes, numRSBlocks, i,
        numDataBytesInBlock, numEcBytesInBlock);

      var size = numDataBytesInBlock[0];
      var dataBytes = new Array(size);
      bits.toBytes(8 * dataBytesOffset, dataBytes, 0, size);
      var ecBytes = _.generateECBytes(dataBytes, numEcBytesInBlock[0]);
      blocks.push(new BlockPair(dataBytes, ecBytes));

      maxNumDataBytes = Math.max(maxNumDataBytes, size);
      maxNumEcBytes = Math.max(maxNumEcBytes, ecBytes.length);
      dataBytesOffset += numDataBytesInBlock[0];
    }
    if (numDataBytes != dataBytesOffset) {
      throw new WriterError('Data bytes does not match offset');
    }

    var result = new BitArray();

    // First, place data blocks.
    for (i = 0; i < maxNumDataBytes; ++i) {
      blocks.forEach(function(block) {
        var dataBytes = block.getDataBytes();
        if (i < dataBytes.length) {
          result.appendBits(dataBytes[i], 8);
        }
      });
    }
    // Then, place error correction blocks.
    for (i = 0; i < maxNumEcBytes; ++i) {
      blocks.forEach(function(block) {
        var ecBytes = block.getErrorCorrectionBytes();
        if (i < ecBytes.length) {
          result.appendBits(ecBytes[i], 8);
        }
      });
    }
    if (numTotalBytes != result.getSizeInBytes()) {  // Should be same.
      throw new WriterError('Interleaving error: ' + numTotalBytes +
        ' and ' + result.getSizeInBytes() + ' differ.');
    }

    return result;
  };

  /**
   * @param {Array.<number>} dataBytes bytes.
   * @param {number} numEcBytesInBlock num.
   * @return {Array.<number>} bytes.
   */
  _.generateECBytes = function(dataBytes, numEcBytesInBlock) {
    var numDataBytes = dataBytes.length;
    var toEncode = new Array(numDataBytes + numEcBytesInBlock);
    var i;
    for (i = 0; i < numDataBytes; i++) {
      toEncode[i] = dataBytes[i] & 0xFF;
    }
    new ReedSolomonEncoder(w69b.qr.GF256.QR_CODE_FIELD).encode(toEncode,
      numEcBytesInBlock);

    var ecBytes = new Array(numEcBytesInBlock);
    for (i = 0; i < numEcBytesInBlock; i++) {
      ecBytes[i] = toEncode[numDataBytes + i];
    }
    return ecBytes;
  };

  /**
   * Append mode info. On success, store the result in "bits".
   */
  _.appendModeInfo = function(mode, bits) {
    bits.appendBits(mode.getBits(), 4);
  };


  /**
   * Append length info. On success, store the result in "bits".
   */
  _.appendLengthInfo = function(numLetters, version, mode, bits) {
    var numBits = mode.getCharacterCountBits(version);
    if (numLetters >= (1 << numBits)) {
      throw new WriterError(numLetters + ' is bigger than ' +
        ((1 << numBits) - 1));
    }
    bits.appendBits(numLetters, numBits);
  };

  /**
   * Append "bytes" in "mode" mode (encoding) into "bits".
   * On success, store the result in "bits".
   */
  _.appendBytes = function(content, mode, bits, encoding) {
    switch (mode) {
      case ModeEnum.NUMERIC:
        _.appendNumericBytes(content, bits);
        break;
      case ModeEnum.ALPHANUMERIC:
        _.appendAlphanumericBytes(content, bits);
        break;
      case ModeEnum.BYTE:
        _.append8BitBytes(content, bits, encoding);
        break;
      case ModeEnum.KANJI:
        _.appendKanjiBytes(content, bits);
        break;
      default:
        throw new WriterError('Invalid mode: ' + mode);
    }
  };

  _.appendNumericBytes = function(content, bits) {
    var length = content.length;
    var i = 0;
    var num2;
    var codeZero = '0'.charCodeAt(0);
    while (i < length) {
      var num1 = content.charCodeAt(i) - codeZero;
      if (i + 2 < length) {
        // Encode three numeric letters in ten bits.
        num2 = content.charCodeAt(i + 1) - codeZero;
        var num3 = content.charCodeAt(i + 2) - codeZero;
        bits.appendBits(num1 * 100 + num2 * 10 + num3, 10);
        i += 3;
      } else if (i + 1 < length) {
        // Encode two numeric letters in seven bits.
        num2 = content.charCodeAt(i + 1) - codeZero;
        bits.appendBits(num1 * 10 + num2, 7);
        i += 2;
      } else {
        // Encode one numeric letter in four bits.
        bits.appendBits(num1, 4);
        i++;
      }
    }
  };

  _.appendAlphanumericBytes = function(content, bits) {
    var length = content.length;
    var i = 0;
    while (i < length) {
      var code1 = _.getAlphanumericCode(content.charCodeAt(i));
      if (code1 == -1) {
        throw new WriterError();
      }
      if (i + 1 < length) {
        var code2 = _.getAlphanumericCode(content.charCodeAt(i + 1));
        if (code2 == -1) {
          throw new WriterError();
        }
        // Encode two alphanumeric letters in 11 bits.
        bits.appendBits(code1 * 45 + code2, 11);
        i += 2;
      } else {
        // Encode one alphanumeric letter in six bits.
        bits.appendBits(code1, 6);
        i++;
      }
    }
  };

  _.append8BitBytes = function(content, bits, encoding) {
    var bytes;
    try {
      bytes = stringutils.stringToBytes(content, encoding);
    } catch (uee) {
      throw new WriterError(uee);
    }
    bytes.forEach(function(b) {
      bits.appendBits(b, 8);
    });
  };

  _.appendKanjiBytes = function(content, bits) {
    var bytes;
    try {
      bytes = stringutils.stringToBytes(content, 'Shift_JIS');
    } catch (uee) {
      throw new WriterError(uee);
    }
    var length = bytes.length;
    for (var i = 0; i < length; i += 2) {
      var byte1 = bytes[i] & 0xFF;
      var byte2 = bytes[i + 1] & 0xFF;
      var code = (byte1 << 8) | byte2;
      var subtracted = -1;
      if (code >= 0x8140 && code <= 0x9ffc) {
        subtracted = code - 0x8140;
      } else if (code >= 0xe040 && code <= 0xebbf) {
        subtracted = code - 0xc140;
      }
      if (subtracted == -1) {
        throw new WriterError('Invalid byte sequence');
      }
      var encoded = ((subtracted >> 8) * 0xc0) + (subtracted & 0xff);
      bits.appendBits(encoded, 13);
    }
  };

  _.appendECI = function(eci, bits) {
    bits.appendBits(ModeEnum.ECI.getBits(), 4);
    // This is correct for values up to 127, which is all we need now.
    bits.appendBits(eci, 8);
  };

});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2009 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

goog.provide('w69b.qr.Binarizer');

goog.scope(function() {

/**
 * This class hierarchy provides a set of methods to convert luminance data to
 * 1 bit data.  It allows the algorithm to vary polymorphically, for example
 * allowing a very expensive thresholding technique for servers and a fast one
 * for mobile. It also permits the implementation to vary, e.g. a JNI version
 * for Android and a Java fallback version for other platforms.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * Ported to js by Manuel Braun
 *
 *  @param {w69b.qr.QRImage} source gray values .
 *  @constructor
 */
w69b.qr.Binarizer = function(source) {
  /**
   * @protected
   * @type {w69b.qr.QRImage}
   */
  this.source = source;
};
  var Binarizer = w69b.qr.Binarizer;
  var pro = Binarizer.prototype;

  /**
   * @return {w69b.qr.QRImage} image.
   */
  pro.getLuminanceSource = function() {
    return this.source;
  };

  /**
   * Converts one row of luminance data to 1 bit data. May actually do the
   * conversion, or return cached data. Callers should assume this method is
   * expensive and call it as seldom as possible.  This method is intended for
   * decoding 1D barcodes and may choose to apply sharpening.  For callers
   * which only examine one row of pixels at a time, the same BitArray should
   * be reused and passed in with each call for performance. However it is
   * legal to keep more than one row at a time if needed.
   *
   * @param {number} y The row to fetch, 0 <= y < bitmap height.
   * @param {w69b.qr.BitArray} opt_row An optional preallocated array. If null
   * or too small, it will be ignored.  If used, the Binarizer will call
   * BitArray.clear(). Always use the returned object.
   * @return {!w69b.qr.BitArray} The array of bits for this row (true means
   * black).
   */
  pro.getBlackRow = function(y, opt_row) { throw Error(); };

  /**
   * Converts a 2D array of luminance data to 1 bit data. As above, assume this
   * method is expensive and do not call it repeatedly. This method is intended
   * for decoding 2D barcodes and may or may not apply sharpening. Therefore, a
   * row from this matrix may not be identical to one fetched using
   * getBlackRow(), so don't mix and match between them.
   *
   * @return {!w69b.qr.BitMatrix} The 2D array of bits for the image
   * (true means black).
   */
  pro.getBlackMatrix = function() { throw Error(); };

  /**
   * Creates a new object with the same type as this Binarizer implementation,
   * but with pristine state. This is needed because Binarizer implementations
   * may be stateful, e.g. keeping a cache of 1 bit data. See Effective Java
   * for why we can't use Java's clone() method.
   *
   * @param {w69b.qr.QRImage} source The LuminanceSource this Binarizer
   * will operate on.
   * @return {w69b.qr.Binarizer} A new concrete Binarizer implementation
   * object.
   */
  pro.createBinarizer = function(source) { throw Error(); };

  /**
   * @return {number} width.
   */
  pro.getWidth = function() {
    return this.source.width;
  };

  /**
   * @return {number} height.
   */
  pro.getHeight = function() {
    return this.source.height;
  };

});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2009 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.GlobalHistogramBinarizer');
goog.require('w69b.qr.Binarizer');
goog.require('w69b.qr.BitArray');
goog.require('w69b.qr.BitMatrix');
goog.require('w69b.qr.NotFoundError');


goog.scope(function() {
  var BitMatrix = w69b.qr.BitMatrix;
  var BitArray = w69b.qr.BitArray;
   /**
   * This Binarizer implementation uses the old ZXing global histogram
   * approach. It is suitable for low-end mobile devices which don't have
   * enough CPU or memory to use a local thresholding algorithm. However,
   * because it picks a global black point, it cannot handle difficult shadows
   * and gradients.
   *
   * Faster mobile devices and all desktop applications should probably use
   * HybridBinarizer instead.
   *
   * @author dswitkin@google.com (Daniel Switkin)
   * @author Sean Owen
   * Ported to js by Manuel Braun
   *
    * @param {w69b.qr.QRImage} source gray values.
   * @constructor
   * @extends {w69b.qr.Binarizer}
   */
  w69b.qr.GlobalHistogramBinarizer = function(source) {
    goog.base(this, source);
    /**
     * @type {Uint8Array}
     * @private
     */
    this.luminances_ = new Uint8Array(0);
    /**
     * @type {Uint8Array}
     * @private
     */
    this.buckets_ = new Uint8Array(_.LUMINANCE_BUCKETS);
  };
  var _ = w69b.qr.GlobalHistogramBinarizer;
  goog.inherits(_, w69b.qr.Binarizer);
  var pro = _.prototype;


  _.LUMINANCE_BITS = 5;
  _.LUMINANCE_SHIFT = 8 - _.LUMINANCE_BITS;
  _.LUMINANCE_BUCKETS = 1 << _.LUMINANCE_BITS;


  /**
   * Applies simple sharpening to the row data to improve performance of the 1D
   * Readers.
   * @override
   */
    pro.getBlackRow = function(y, row) {
      var x;
      var source = this.getLuminanceSource();
      var width = source.getWidth();
      if (row == null || row.getSize() < width) {
        row = new BitArray(width);
      } else {
        row.clear();
      }

      this.initArrays(width);
      var localLuminances = source.getRow(y, this.luminances_);
      var localBuckets = this.buckets_;
      for (x = 0; x < width; x++) {
        var pixel = localLuminances[x] & 0xff;
        localBuckets[pixel >> _.LUMINANCE_SHIFT]++;
      }
      var blackPoint = _.estimateBlackPoint(localBuckets);

      var left = localLuminances[0] & 0xff;
      var center = localLuminances[1] & 0xff;
      for (x = 1; x < width - 1; x++) {
        var right = localLuminances[x + 1] & 0xff;
        // A simple -1 4 -1 box filter with a weight of 2.
        var luminance = ((center << 2) - left - right) >> 1;
        if (luminance < blackPoint) {
          row.set(x);
        }
        left = center;
        center = right;
      }
      return row;
    };

    /**
     * Does not sharpen the data, as this call is intended to only be used by
     * 2D Readers.
     * @override
     */
    pro.getBlackMatrix = function() {
      var source = this.getLuminanceSource();
      var width = source.getWidth();
      var height = source.getHeight();
      var matrix = new BitMatrix(width, height);

      // nasty js scopes.
      var localLuminances, pixel, x, y;
      // Quickly calculates the histogram by sampling four rows from the image.
      // This proved to be more robust on the blackbox tests than sampling a
      // diagonal as we used to do.
      this.initArrays(width);
      var localBuckets = this.buckets_;
      for (y = 1; y < 5; y++) {
        var row = height * y / 5;
        localLuminances = source.getRow(row, this.luminances_);
        var right = (width << 2) / 5;
        for (x = width / 5; x < right; x++) {
          pixel = localLuminances[x] & 0xff;
          localBuckets[pixel >> _.LUMINANCE_SHIFT]++;
        }
      }
      var blackPoint = _.estimateBlackPoint(localBuckets);

      // We delay reading the entire image luminance until the black point
      // estimation succeeds.  Although we end up reading four rows twice, it
      // is consistent with our motto of "fail quickly" which is necessary for
      // continuous scanning.
      localLuminances = source.getMatrix();
      for (y = 0; y < height; y++) {
        var offset = y * width;
        for (x = 0; x < width; x++) {
          pixel = localLuminances[offset + x] & 0xff;
          if (pixel < blackPoint) {
            matrix.set(x, y);
          }
        }
      }

      return matrix;
    };

  /**
   * @override
   */
    pro.createBinarizer = function(source) {
      return new _(source);
    };

    pro.initArrays = function(luminanceSize) {
      if (this.luminances_.length < luminanceSize) {
        this.luminances_ = new Uint8Array(luminanceSize);
      }
      for (var x = 0; x < _.LUMINANCE_BUCKETS; x++) {
        this.buckets_[x] = 0;
      }
    };

    _.estimateBlackPoint = function(buckets) {
      var x, score;
      // Find the tallest peak in the histogram.
      var numBuckets = buckets.length;
      var maxBucketCount = 0;
      var firstPeak = 0;
      var firstPeakSize = 0;
      for (x = 0; x < numBuckets; x++) {
        if (buckets[x] > firstPeakSize) {
          firstPeak = x;
          firstPeakSize = buckets[x];
        }
        if (buckets[x] > maxBucketCount) {
          maxBucketCount = buckets[x];
        }
      }

      // Find the second-tallest peak which is somewhat far from the tallest
      // peak.
      var secondPeak = 0;
      var secondPeakScore = 0;
      for (x = 0; x < numBuckets; x++) {
        var distanceToBiggest = x - firstPeak;
        // Encourage more distant second peaks by multiplying by square of
        // distance.
        score = buckets[x] * distanceToBiggest * distanceToBiggest;
        if (score > secondPeakScore) {
          secondPeak = x;
          secondPeakScore = score;
        }
      }

      // Make sure firstPeak corresponds to the black peak.
      if (firstPeak > secondPeak) {
        var temp = firstPeak;
        firstPeak = secondPeak;
        secondPeak = temp;
      }

      // If there is too little contrast in the image to pick a meaningful
      // black point, throw rather than waste time trying to decode the image,
      // and risk false positives.
      if (secondPeak - firstPeak <= numBuckets >> 4) {
        throw new w69b.qr.NotFoundError();
      }

      // Find a valley between them that is low and closer to the white peak.
      var bestValley = secondPeak - 1;
      var bestValleyScore = -1;
      for (x = secondPeak - 1; x > firstPeak; x--) {
        var fromFirst = x - firstPeak;
        score = fromFirst * fromFirst * (secondPeak - x) *
          (maxBucketCount - buckets[x]);
        if (score > bestValleyScore) {
          bestValley = x;
          bestValleyScore = score;
        }
      }

      return bestValley << _.LUMINANCE_SHIFT;
    };
});


// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.IntArray2D');
goog.scope(function() {
  /**
   * Provides a pre-allocated row-first 2d integer array.
   * @param {number} size1 size of first dimension.
   * @param {number} size2 size ofsecond dimension.
   * @constructor
   */
  w69b.qr.IntArray2D = function(size1, size2) {
    this.size1 = size1;
    this.size2 = size2;
    this.data = new Int32Array(size1 * size2);
  };
  var pro = w69b.qr.IntArray2D.prototype;

  /**
   * Get value.
   * @param {number} dim1 first dimension.
   * @param {number} dim2 second dimension.
   * @return {number} value at given position.
   */
  pro.getAt = function(dim1, dim2) {
    return this.data[this.size2 * dim1 + dim2];
  };
  /**
   * Set value.
   * @param {number} dim1 first dimension.
   * @param {number} dim2 second dimension.
   * @param {number} value at given position.
   */
  pro.setAt = function(dim1, dim2, value) {
    this.data[this.size2 * dim1 + dim2] = value;
  };
});

// javascript (closure) port (c) 2013 Manuel Braun (mb@w69b.com)
/*
 * Copyright 2009 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('w69b.qr.HybridBinarizer');
goog.require('w69b.qr.BitArray');
goog.require('w69b.qr.BitMatrix');
goog.require('w69b.qr.GlobalHistogramBinarizer');
goog.require('w69b.qr.IntArray2D');

goog.scope(function() {
  var BitMatrix = w69b.qr.BitMatrix;
  var IntArray2D = w69b.qr.IntArray2D;
  /**
   * This class implements a local thresholding algorithm, which while slower
   * than the GlobalHistogramBinarizer, is fairly efficient for what it does.
   * It is designed for high frequency images of barcodes with black data on
   * white backgrounds. For this application, it does a much better job than a
   * global blackpoint with severe shadows and gradients.  However it tends to
   * produce artifacts on lower frequency images and is therefore not a good
   * general purpose binarizer for uses outside ZXing.
   *
   * This class extends GlobalHistogramBinarizer, using the older histogram
   * approach for 1D readers, and the newer local approach for 2D readers. 1D
   * decoding using a per-row histogram is already inherently local, and only
   * fails for horizontal gradients. We can revisit that problem later, but for
   * now it was not a win to use local blocks for 1D.
   *
   * This Binarizer is the default for the unit tests and the recommended class
   * for library users.
   *
   * @author dswitkin@google.com (Daniel Switkin)
   * ported to js by Manuel Braun
   *
   * @param {w69b.qr.QRImage} source gray values.
   * @constructor
   * @extends {w69b.qr.GlobalHistogramBinarizer}
   */
  w69b.qr.HybridBinarizer = function(source) {
    goog.base(this, source);
  };
  goog.inherits(w69b.qr.HybridBinarizer, w69b.qr.GlobalHistogramBinarizer);
  var _ = w69b.qr.HybridBinarizer;
  var pro = _.prototype;

  /**
   * @private
   * @type {BitMatrix}
   */
  pro.matrix_;

  // This class uses 5x5 blocks to compute local luminance, where each block is
  // 8x8 pixels.  So this is the smallest dimension in each axis we can accept.
  _.BLOCK_SIZE_POWER = 3;
  _.BLOCK_SIZE = 1 << _.BLOCK_SIZE_POWER; // ...0100...00
  _.BLOCK_SIZE_MASK = _.BLOCK_SIZE - 1;   // ...0011...11
  _.MINIMUM_DIMENSION = _.BLOCK_SIZE * 5;
  _.MIN_DYNAMIC_RANGE = 24;


  /**
   * Calculates the final BitMatrix once for all requests. This could be called
   * once from the constructor instead, but there are some advantages to doing
   * it lazily, such as making profiling easier, and not doing heavy lifting
   * when callers don't expect it.
   * @override
   */
  pro.getBlackMatrix = function() {
    if (this.matrix_ != null) {
      return this.matrix_;
    }
    var source = this.getLuminanceSource();
    var width = source.getWidth();
    var height = source.getHeight();
    if (width >= _.MINIMUM_DIMENSION && height >= _.MINIMUM_DIMENSION) {
      var luminances = source.getMatrix();
      // dived by 8
      var subWidth = width >> _.BLOCK_SIZE_POWER;
      // only even numbers
      if ((width & _.BLOCK_SIZE_MASK) != 0) {
        subWidth++;
      }
      var subHeight = height >> _.BLOCK_SIZE_POWER;
      if ((height & _.BLOCK_SIZE_MASK) != 0) {
        subHeight++;
      }
      var blackPoints = _.calculateBlackPoints(luminances, subWidth,
        subHeight, width, height);

      var newMatrix = new BitMatrix(width, height);
      _.calculateThresholdForBlock(luminances, subWidth, subHeight,
        width, height, blackPoints, newMatrix);
      this.matrix_ = newMatrix;
    } else {
      // If the image is too small, fall back to the global histogram approach.
      this.matrix_ = goog.base(this, 'getBlackMatrix');
    }
    return this.matrix_;
  };

  /**
   * @override
   */
  pro.createBinarizer = function(source) {
    return new _(source);
  };

  /**
   * For each block in the image, calculate the average black point using a 5x5
   * grid of the blocks around it. Also handles the corner cases (fractional
   * blocks are computed based on the last pixels in the row/column which are
   * also used in the previous block).
   */
  _.calculateThresholdForBlock = function(luminances, subWidth, subHeight,
                                          width, height, blackPoints, matrix) {
    for (var y = 0; y < subHeight; y++) {
      var yoffset = y << _.BLOCK_SIZE_POWER;
      var maxYOffset = height - _.BLOCK_SIZE;
      if (yoffset > maxYOffset) {
        yoffset = maxYOffset;
      }
      for (var x = 0; x < subWidth; x++) {
        var xoffset = x << _.BLOCK_SIZE_POWER;
        var maxXOffset = width - _.BLOCK_SIZE;
        if (xoffset > maxXOffset) {
          xoffset = maxXOffset;
        }
        var left = _.cap(x, 2, subWidth - 3);
        var top = _.cap(y, 2, subHeight - 3);
        var sum = 0;
        for (var z = -2; z <= 2; z++) {
          var offset = (top + z) * blackPoints.size2;
          var raw = blackPoints.data;
          sum += raw[offset + left - 2] + raw[offset + left - 1] +
            raw[offset + left] + raw[offset + left + 1] +
            raw[offset + left + 2];
        }
        var average = sum / 25;
        _.thresholdBlock(luminances, xoffset, yoffset, average, width, matrix);
      }
    }
  };

  /**
   * @param {number} value value.
   * @param {number} min min.
   * @param {number} max max.
   * @return {number} capped value.
   */
  _.cap = function(value, min, max) {
    return value < min ? min : value > max ? max : value;
  };

  /**
   * Applies a single threshold to a block of pixels.
   */
  _.thresholdBlock = function(luminances, xoffset, yoffset, threshold, stride,
                              matrix) {
    for (var y = 0, offset = yoffset * stride + xoffset; y < _.BLOCK_SIZE;
         y++, offset += stride) {
      for (var x = 0; x < _.BLOCK_SIZE; x++) {
        // Comparison needs to be <= so that black == 0 pixels are
        // black even if the threshold is 0.
        if ((luminances[offset + x] & 0xFF) <= threshold) {
          matrix.set(xoffset + x, yoffset + y);
        }
      }
    }
  };

  /**
   * Calculates a single black point for each block of pixels and saves it away.
   * See the following thread for a discussion of this algorithm:
   *  http://groups.google.com/group/zxing/browse_thread/thread/d06efa2c35a7ddc0
   */
  _.calculateBlackPoints = function(luminances, subWidth, subHeight, width,
                                    height) {
    var xx;
    var blackPoints = new IntArray2D(subHeight, subWidth);
    for (var y = 0; y < subHeight; y++) {
      var yoffset = y << _.BLOCK_SIZE_POWER;
      var maxYOffset = height - _.BLOCK_SIZE;
      if (yoffset > maxYOffset) {
        yoffset = maxYOffset;
      }
      for (var x = 0; x < subWidth; x++) {
        var xoffset = x << _.BLOCK_SIZE_POWER;
        var maxXOffset = width - _.BLOCK_SIZE;
        if (xoffset > maxXOffset) {
          xoffset = maxXOffset;
        }
        var sum = 0;
        var min = 0xFF;
        var max = 0;
        for (var yy = 0, offset = yoffset * width + xoffset;
             yy < _.BLOCK_SIZE; yy++, offset += width) {
          for (xx = 0; xx < _.BLOCK_SIZE; xx++) {
            var pixel = luminances[offset + xx] & 0xFF;
            sum += pixel;
            // still looking for good contrast
            if (pixel < min) {
              min = pixel;
            }
            if (pixel > max) {
              max = pixel;
            }
          }
          // short-circuit min/max tests once dynamic range is met
          if (max - min > _.MIN_DYNAMIC_RANGE) {
            // finish the rest of the rows quickly
            for (yy++, offset += width;
                 yy < _.BLOCK_SIZE; yy++, offset += width) {
              for (xx = 0; xx < _.BLOCK_SIZE; xx++) {
                sum += luminances[offset + xx] & 0xFF;
              }
            }
          }
        }

        // The default estimate is the average of the values in the block.
        var average = sum >> (_.BLOCK_SIZE_POWER * 2);
        if (max - min <= _.MIN_DYNAMIC_RANGE) {
          // If variation within the block is low, assume this is a block with
          // only light or only dark pixels. In that case we do not want to use
          // the average, as it would divide this low contrast area into black
          // and white pixels, essentially creating data out of noise.
          //
          // The default assumption is that the block is light/background.
          // Since no estimate for the level of dark pixels exists locally, use
          // half the min for the block.
          average = min >> 1;

          if (y > 0 && x > 0) {
            // Correct the "white background" assumption for blocks that have
            // neighbors by comparing the pixels in this block to the
            // previously calculated black points. This is based on the fact
            // that dark barcode symbology is always surrounded by some amount
            // of light background for which reasonable black point estimates
            // were made. The bp estimated at the boundaries is used for the
            // interior.

            // The (min < bp) is arbitrary but works better than other
            // heuristics that were tried.
            var averageNeighborBlackPoint = (blackPoints.getAt(y - 1, x) +
              (2 * blackPoints.getAt(y, x - 1)) +
              blackPoints.getAt(y - 1, x - 1)) >> 2;
            if (min < averageNeighborBlackPoint) {
              average = averageNeighborBlackPoint;
            }
          }
        }
        blackPoints.setAt(y, x, average);
      }
    }
    return blackPoints;
  };
});


// (c) 2013 Manuel Braun (mb@w69b.com)

goog.provide('w69b.qr.nativepreprocessing');
goog.require('w69b.qr.HybridBinarizer');
goog.require('w69b.qr.QRImage');

goog.scope(function() {
  var _ = w69b.qr.nativepreprocessing;
  var QRImage = w69b.qr.QRImage;

  /**
   * @param {(!ImageData|!w69b.qr.QRImage)} imageData from canvas.
   * @return {!w69b.qr.BitMatrix} binary data.
   */
  _.binarizeImageData = function(imageData) {
    var gray = _.grayscale(imageData);
    var binarizer = new w69b.qr.HybridBinarizer(gray);
    return binarizer.getBlackMatrix();
  };

  /**
   * Returns grayscale version of image.
   * @param {(!ImageData|!w69b.qr.QRImage)} imageData from canvas.
   * @return {!w69b.qr.QRImage} binary data.
   */
  _.grayscale = function(imageData) {
    var grayImg = QRImage.newEmpty(imageData.width, imageData.height);
    var grayData = grayImg.data;
    var rgbaData = imageData.data;

    for (var i = 0; i < grayData.length; ++i) {
      var rgbaPos = i * 4;
      grayData[i] = (rgbaData[rgbaPos] * 33 +
        rgbaData[rgbaPos + 1] * 34 +
        rgbaData[rgbaPos + 2] * 33) / 100;
    }
    return grayImg;
  };

});


// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.imagedecoding');
goog.require('w69b.img.RGBABitMatrix');
goog.require('w69b.img.WebGLBinarizer');
goog.require('w69b.imgtools');
goog.require('w69b.qr.DecodeResult');
goog.require('w69b.qr.Detector');
goog.require('w69b.qr.QRImage');
goog.require('w69b.qr.ReaderError');
goog.require('w69b.qr.decoder');
goog.require('w69b.qr.encoder.Encoder');
goog.require('w69b.qr.nativepreprocessing');

/**
 * Simple high-level interface to decode qr codes.
 * @author mb@w69b.com (Manuel Braun)
 */
goog.scope(function() {
  var Detector = w69b.qr.Detector;
  var RGBABitMatrix = w69b.img.RGBABitMatrix;
  var DecodeResult = w69b.qr.DecodeResult;
  var WebGLBinarizer = w69b.img.WebGLBinarizer;
  var imgtools = w69b.imgtools;
  var preprocessing = w69b.qr.nativepreprocessing;

  var _ = w69b.qr.imagedecoding;

  _.webGLBinarizer_ = null;

  _.getWebGLBinarizer_ = function() {
    if (!_.webGLBinarizer_) {
      _.webGLBinarizer_ = new WebGLBinarizer();
    }
    return _.webGLBinarizer_;
  };

  /**
   * Decode qr code in main thread.
   * @param {(Image|HTMLVideoElement)} img image or video.
   * @param {?w69b.qr.ResultPointCallback=} callback callback for patterns.
   * @param {boolean=} opt_webgl whether to use WebGl binarizer if supported.
   * @return {DecodeResult} result.
   */
  _.decode = function(img, callback, opt_webgl) {
    var imgData;
    if (opt_webgl && WebGLBinarizer.isSupported()) {
      var binarizer = _.getWebGLBinarizer_();
      binarizer.setup(img.width || img.videoHeight, img.height || img.videoHeight);
      binarizer.render(img);
      imgData = binarizer.getBitMatrix();
    } else {
      imgData = imgtools.getImageData(img, 700);
    }
    return _.decodeFromImageData(imgData, callback);
  };

  /**
   * Decode qr code from ImageData or preprocessed RGBABitMatrix.
   * @param {(!ImageData|!w69b.qr.QRImage|!RGBABitMatrix)} imgdata from canvas.
   * @param {?w69b.qr.ResultPointCallback=} opt_callback callback.
   * @return {DecodeResult} decoded qr code.
   */
  _.decodeFromImageData = function(imgdata, opt_callback) {
    var result;
    try {
      result = _.decodeFromImageDataThrowing(imgdata, opt_callback);
    } catch (err) {
      result = new DecodeResult(err);
      if (!(err instanceof w69b.qr.ReaderError))
        throw err;
    }
    return result;
  };

  /**
   * Throws ReaderError if detection fails.
   * @param {(!ImageData|!w69b.qr.QRImage|!RGBABitMatrix)} imgdata from canvas.
   * @param {?w69b.qr.ResultPointCallback=} opt_callback callback.
   * @return {DecodeResult} decoded qr code.
   */
  _.decodeFromImageDataThrowing = function(imgdata, opt_callback) {
    var bitmap;
    if (imgdata instanceof RGBABitMatrix) {
      bitmap = imgdata;
    } else {
      bitmap = preprocessing.binarizeImageData(imgdata);
    }
    var detector = new Detector(bitmap, opt_callback);

    var detectorResult = detector.detect();
    var text = w69b.qr.decoder.decode(detectorResult.bits);

    return new DecodeResult(text, detectorResult.points);
  };

});

goog.exportSymbol('w69b.qr.imagedecoding.decodeFromImageData',
  w69b.qr.imagedecoding.decodeFromImageData);

// (c) 2013 Manuel Braun (mb@w69b.com)
goog.provide('w69b.qr.DecodeWorker');
goog.require('goog.userAgent.product');
goog.require('w69b.img.RGBABitMatrix');
goog.require('w69b.qr.InvalidCharsetError');
goog.require('w69b.qr.QRImage');
goog.require('w69b.qr.ReaderError');
goog.require('w69b.qr.WorkerMessageType');
goog.require('w69b.qr.imagedecoding');

// Hack to work arround closure warnings.
var host = self;

goog.scope(function() {
  var qrcode = w69b.qr.imagedecoding;
  var ReaderError = w69b.qr.ReaderError;
  var WorkerMessageType = w69b.qr.WorkerMessageType;

  var _ = w69b.qr.DecodeWorker;
  _.iconvPath = 'iconv.js';

  /**
   * @param {string} msgType messsage type.
   * @param {*=} opt_result value.
   */
  _.send = function(msgType, opt_result) {
    host.postMessage([msgType, host['JSON'].stringify(opt_result)]);
  };

  /**
   * @param {(!w69b.qr.QRImage|!w69b.img.RGBABitMatrix)} imgdata image to
   * @param {boolean=} failOnCharset immediately fail on charset error if true,
   * do not try to load iconv.
   * decode.
   */
  _.decode = function(imgdata, failOnCharset) {
    var result;
    try {
      result = qrcode.decodeFromImageData(imgdata, _.onPatternFound);
    } catch (err) {
      if (err instanceof w69b.qr.InvalidCharsetError && !self.iconv &&
        _.iconvPath && !failOnCharset) {
        // load iconv.
        importScripts(_.iconvPath);
        // and try again.
        _.decode(imgdata, true);
        return;
      } else {
        throw err;
      }
    }
    if (result.isError()) {
      var err = result.getError();
      _.send(WorkerMessageType.NOTFOUND, err && err.message);
    } else {
      _.send(WorkerMessageType.DECODED, result);
    }
  };

  /**
   * @param {(w69b.qr.AlignmentPattern|w69b.qr.FinderPattern)} pattern found.
   */
  _.onPatternFound = function(pattern) {
    // Build plain json object.
    _.send(WorkerMessageType.PATTERN, pattern);
  };


  /**
   * Received message from host.
   */
  self.onmessage = function(event) {
    var data = event.data;
    // Message only sent for feature detection of transferable objects.
    if (data['isfeaturedetect']) {
      // do nothing.
    } else if (data['setIconvUrl']) {
      _.iconvPath = data['setIconvUrl'];
    } else {
      // decode
      var width = data['width'];
      var height = data['height'];
      var buffer = data['buffer'];
      var isBinary = data['isBinary'];
      if (!buffer.byteLength) {
        throw Error('worker commmunication failed');
      }
      var image;
      if (isBinary) {
        image = new w69b.img.RGBABitMatrix(width, height,
          new Uint8ClampedArray(buffer));
      } else {
        image = new w69b.qr.QRImage(width, height,
          new Uint8ClampedArray(buffer));
      }
      _.decode(image);
      // Hack for FF memory leak - if webgl is used, we tranfer back the
      // buffer as a workaround.
      if (goog.userAgent.product.FIREFOX) {
        host.postMessage(['ffmemoryhack', null], [buffer]);
        event.data['buffer'] = null;
        // event.data = null;
      }
    }
  };
});
