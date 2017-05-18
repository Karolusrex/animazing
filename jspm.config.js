SystemJS.config({
  paths: {
    "github:": "jspm_packages/github/",
    "npm:": "jspm_packages/npm/",
    "bitbucket:": "jspm_packages/bitbucket/",
    "shapeshifter/": "src/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  arvaOptions: {
    "fileMappings": {
      "github:bizboard/arva-js@develop": "../arva-js",
      "github:bizboard/famous-flex@master": "../famous-flex"
    }
  },
  devConfig: {
    "map": {
      "core-js": "npm:core-js@1.2.6",
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.19",
      "babel-plugin-transform-decorators-legacy": "npm:babel-plugin-transform-decorators-legacy@1.3.4",
      "babel-plugin-transform-es2015-classes": "npm:babel-plugin-transform-es2015-classes@6.18.0",
      "babel-plugin-transform-class-properties": "npm:babel-plugin-transform-class-properties@6.19.0",
      "babel-plugin-transform-async-functions": "npm:babel-plugin-transform-async-functions@6.8.0",
      "babel-plugin-transform-builtin-extend": "npm:babel-plugin-transform-builtin-extend@1.1.0",
      "babel-plugin-transform-es2015-spread": "npm:babel-plugin-transform-es2015-spread@6.8.0",
      "babel-plugin-transform-decorators": "npm:babel-plugin-transform-decorators@6.13.0",
      "babel-plugin-transform-es2015-for-of": "npm:babel-plugin-transform-es2015-for-of@6.18.0",
      "babel-plugin-syntax-decorators": "npm:babel-plugin-syntax-decorators@6.13.0",
      "babel-plugin-transform-runtime-constructor-name": "github:bizboard/babel-plugin-transform-runtime-constructor-name@master"
    },
    "packages": {
      "npm:core-js@1.2.6": {
        "map": {}
      },
      "npm:babel-plugin-transform-decorators-legacy@1.3.4": {
        "map": {
          "babel-plugin-syntax-decorators": "npm:babel-plugin-syntax-decorators@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-template": "npm:babel-template@6.16.0"
        }
      },
      "npm:babel-plugin-transform-decorators@6.13.0": {
        "map": {
          "babel-plugin-syntax-decorators": "npm:babel-plugin-syntax-decorators@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-helper-define-map": "npm:babel-helper-define-map@6.18.0",
          "babel-helper-explode-class": "npm:babel-helper-explode-class@6.18.0",
          "babel-template": "npm:babel-template@6.16.0",
          "babel-types": "npm:babel-types@6.21.0"
        }
      },
      "npm:babel-plugin-transform-es2015-classes@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-helper-define-map": "npm:babel-helper-define-map@6.18.0",
          "babel-messages": "npm:babel-messages@6.8.0",
          "babel-helper-optimise-call-expression": "npm:babel-helper-optimise-call-expression@6.18.0",
          "babel-helper-function-name": "npm:babel-helper-function-name@6.18.0",
          "babel-helper-replace-supers": "npm:babel-helper-replace-supers@6.18.0",
          "babel-template": "npm:babel-template@6.16.0",
          "babel-types": "npm:babel-types@6.21.0",
          "babel-traverse": "npm:babel-traverse@6.21.0"
        }
      },
      "npm:babel-plugin-transform-async-functions@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-plugin-syntax-async-functions": "npm:babel-plugin-syntax-async-functions@6.13.0"
        }
      },
      "npm:babel-plugin-transform-es2015-spread@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0"
        }
      },
      "npm:babel-plugin-transform-es2015-for-of@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0"
        }
      },
      "npm:babel-plugin-transform-builtin-extend@1.1.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-template": "npm:babel-template@6.16.0"
        }
      },
      "npm:babel-plugin-transform-class-properties@6.19.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-helper-function-name": "npm:babel-helper-function-name@6.18.0",
          "babel-plugin-syntax-class-properties": "npm:babel-plugin-syntax-class-properties@6.13.0",
          "babel-template": "npm:babel-template@6.16.0"
        }
      },
      "npm:babel-helper-replace-supers@6.18.0": {
        "map": {
          "babel-helper-optimise-call-expression": "npm:babel-helper-optimise-call-expression@6.18.0",
          "babel-messages": "npm:babel-messages@6.8.0",
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-template": "npm:babel-template@6.16.0",
          "babel-types": "npm:babel-types@6.21.0",
          "babel-traverse": "npm:babel-traverse@6.21.0"
        }
      },
      "npm:babel-helper-define-map@6.18.0": {
        "map": {
          "lodash": "npm:lodash@4.15.0",
          "babel-helper-function-name": "npm:babel-helper-function-name@6.18.0",
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-types": "npm:babel-types@6.21.0"
        }
      },
      "npm:babel-helper-explode-class@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-types": "npm:babel-types@6.21.0",
          "babel-traverse": "npm:babel-traverse@6.21.0",
          "babel-helper-bindify-decorators": "npm:babel-helper-bindify-decorators@6.18.0"
        }
      },
      "npm:babel-messages@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0"
        }
      },
      "npm:babel-helper-optimise-call-expression@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-types": "npm:babel-types@6.21.0"
        }
      },
      "npm:babel-helper-function-name@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-types": "npm:babel-types@6.21.0",
          "babel-template": "npm:babel-template@6.16.0",
          "babel-traverse": "npm:babel-traverse@6.21.0",
          "babel-helper-get-function-arity": "npm:babel-helper-get-function-arity@6.18.0"
        }
      },
      "npm:babel-types@6.21.0": {
        "map": {
          "lodash": "npm:lodash@4.15.0",
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "to-fast-properties": "npm:to-fast-properties@1.0.2",
          "esutils": "npm:esutils@2.0.2"
        }
      },
      "npm:babel-traverse@6.21.0": {
        "map": {
          "babel-messages": "npm:babel-messages@6.8.0",
          "lodash": "npm:lodash@4.15.0",
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-types": "npm:babel-types@6.21.0",
          "globals": "npm:globals@9.14.0",
          "invariant": "npm:invariant@2.2.2",
          "babel-code-frame": "npm:babel-code-frame@6.20.0",
          "debug": "npm:debug@2.6.0",
          "babylon": "npm:babylon@6.15.0"
        }
      },
      "npm:babel-template@6.16.0": {
        "map": {
          "lodash": "npm:lodash@4.15.0",
          "babel-traverse": "npm:babel-traverse@6.21.0",
          "babel-types": "npm:babel-types@6.21.0",
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babylon": "npm:babylon@6.15.0"
        }
      },
      "npm:babel-helper-get-function-arity@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-types": "npm:babel-types@6.21.0"
        }
      },
      "npm:babel-helper-bindify-decorators@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.20.0",
          "babel-traverse": "npm:babel-traverse@6.21.0",
          "babel-types": "npm:babel-types@6.21.0"
        }
      },
      "npm:babel-code-frame@6.20.0": {
        "map": {
          "esutils": "npm:esutils@2.0.2",
          "js-tokens": "npm:js-tokens@2.0.0",
          "chalk": "npm:chalk@1.1.3"
        }
      },
      "npm:invariant@2.2.2": {
        "map": {
          "loose-envify": "npm:loose-envify@1.3.0"
        }
      },
      "npm:loose-envify@1.3.0": {
        "map": {
          "js-tokens": "npm:js-tokens@2.0.0"
        }
      },
      "npm:debug@2.6.0": {
        "map": {
          "ms": "npm:ms@0.7.2"
        }
      },
      "npm:chalk@1.1.3": {
        "map": {
          "strip-ansi": "npm:strip-ansi@3.0.1",
          "ansi-styles": "npm:ansi-styles@2.2.1",
          "has-ansi": "npm:has-ansi@2.0.0",
          "escape-string-regexp": "npm:escape-string-regexp@1.0.5",
          "supports-color": "npm:supports-color@2.0.0"
        }
      },
      "npm:strip-ansi@3.0.1": {
        "map": {
          "ansi-regex": "npm:ansi-regex@2.1.1"
        }
      },
      "npm:has-ansi@2.0.0": {
        "map": {
          "ansi-regex": "npm:ansi-regex@2.1.1"
        }
      }
    }
  },
  transpiler: "plugin-babel",
  babelOptions: {
    "plugins": [
      "babel-plugin-transform-decorators-legacy",
      "babel-plugin-transform-class-properties",
      [
        "babel-plugin-transform-builtin-extend",
        {
          "globals": [
            "Array"
          ],
          "approximate": true
        }
      ]
    ]
  },
  meta: {
    "/*.css": {
      "loader": "css"
    },
    "/*.svg": {
      "loader": "arva-utils/ImageLoader"
    },
    "/*.png": {
      "loader": "arva-js/utils/ImageLoader"
    },
    "/*.jpg": {
      "loader": "arva-utils/ImageLoader"
    }
  },
  packages: {
    "shapeshifter": {
      "main": "shapeshifter.js",
      "format": "esm"
    }
  },
  map: {
    "bizboard/arva-kit": "bitbucket:bizboard/arva-kit@master"
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "bitbucket:*/*.json",
    "github:*/*.json"
  ],
  map: {
    "arva-js": "github:bizboard/arva-js@develop",
    "arva-kit": "bitbucket:bizboard/arva-kit@master",
    "assert": "npm:jspm-nodelibs-assert@0.2.0",
    "babel-polyfill": "npm:babel-polyfill@6.20.0",
    "buffer": "npm:jspm-nodelibs-buffer@0.2.1",
    "child_process": "npm:jspm-nodelibs-child_process@0.2.0",
    "clean-css": "npm:clean-css@3.4.8",
    "constants": "npm:jspm-nodelibs-constants@0.2.0",
    "crypto": "npm:jspm-nodelibs-crypto@0.2.0",
    "css": "github:systemjs/plugin-css@0.1.32",
    "di.js": "github:bizboard/di.js@master",
    "dns": "npm:jspm-nodelibs-dns@0.2.0",
    "events": "npm:jspm-nodelibs-events@0.2.0",
    "famous": "github:bizboard/famous@develop",
    "famous-flex": "github:bizboard/famous-flex@experiment-patch-cfg",
    "fastclick": "npm:fastclick@1.0.6",
    "firebase": "npm:firebase@3.6.5",
    "fs": "npm:jspm-nodelibs-fs@0.2.0",
    "http": "npm:jspm-nodelibs-http@0.2.0",
    "https": "npm:jspm-nodelibs-https@0.2.1",
    "insert-rule": "npm:insert-rule@2.1.0",
    "lodash": "npm:lodash@4.15.0",
    "module": "npm:jspm-nodelibs-module@0.2.0",
    "net": "npm:jspm-nodelibs-net@0.2.0",
    "os": "npm:jspm-nodelibs-os@0.2.0",
    "path": "npm:jspm-nodelibs-path@0.2.0",
    "process": "github:jspm/nodelibs-process@0.2.0-alpha",
    "stream": "npm:jspm-nodelibs-stream@0.2.0",
    "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.0",
    "text": "github:systemjs/plugin-text@0.0.8",
    "timers": "npm:jspm-nodelibs-timers@0.2.0",
    "tls": "npm:jspm-nodelibs-tls@0.2.0",
    "url": "npm:jspm-nodelibs-url@0.2.0",
    "util": "npm:jspm-nodelibs-util@0.2.1",
    "vm": "npm:jspm-nodelibs-vm@0.2.0"
  },
  packages: {
    "bitbucket:bizboard/arva-kit@master": {
      "map": {
        "arva-js": "github:bizboard/arva-js@develop",
        "famous": "github:bizboard/famous@develop",
        "famous-bkimagesurface": "github:bizboard/famous-bkimagesurface@master",
        "famous-flex": "github:bizboard/famous-flex@experiment-patch-cfg",
        "lodash": "npm:lodash@4.13.1",
        "bowser": "npm:bowser@1.4.3",
        "color": "npm:color@0.11.4",
        "rgbcolor": "npm:rgbcolor@0.0.4",
        "degrees-radians": "npm:degrees-radians@1.0.3",
        "famous-autosizetextarea": "github:ijzerenhein/famous-autosizetextarea@0.3.1"
      }
    },
    "github:bizboard/arva-js@develop": {
      "map": {
        "bowser": "npm:bowser@1.4.1",
        "camelcase": "npm:camelcase@2.1.1",
        "eventemitter3": "npm:eventemitter3@1.2.0",
        "famous": "github:bizboard/famous@develop",
        "famous-flex": "github:bizboard/famous-flex@experiment-patch-cfg",
        "firebase": "github:firebase/firebase-bower@3.2.0",
        "lodash": "npm:lodash@4.13.1",
        "ordered-hashmap": "npm:ordered-hashmap@1.0.0",
        "request-animation-frame-mock": "github:erykpiast/request-animation-frame-mock@0.1.8",
        "xml2js": "npm:xml2js@0.4.17",
        "fastclick": "npm:fastclick@1.0.6",
        "lodash-decorators": "npm:lodash-decorators@3.0.2"
      }
    },
    "npm:amdefine@1.0.0": {
      "map": {}
    },
    "npm:clean-css@3.4.8": {
      "map": {
        "commander": "npm:commander@2.8.1",
        "source-map": "npm:source-map@0.4.4"
      }
    },
    "npm:commander@2.8.1": {
      "map": {
        "graceful-readlink": "npm:graceful-readlink@1.0.1"
      }
    },
    "npm:core-util-is@1.0.2": {
      "map": {}
    },
    "npm:graceful-readlink@1.0.1": {
      "map": {}
    },
    "npm:insert-rule@2.1.0": {
      "map": {}
    },
    "npm:isarray@1.0.0": {
      "map": {}
    },
    "npm:lodash@4.13.1": {
      "map": {}
    },
    "npm:process@0.11.5": {
      "map": {}
    },
    "npm:punycode@1.3.2": {
      "map": {}
    },
    "npm:sax@1.2.1": {
      "map": {}
    },
    "npm:source-map@0.4.4": {
      "map": {
        "amdefine": "npm:amdefine@1.0.0"
      }
    },
    "npm:string_decoder@0.10.31": {
      "map": {}
    },
    "npm:timers-browserify@1.4.2": {
      "map": {
        "process": "npm:process@0.11.5"
      }
    },
    "npm:xml2js@0.4.17": {
      "map": {
        "sax": "npm:sax@1.2.1",
        "xmlbuilder": "npm:xmlbuilder@4.2.1"
      }
    },
    "npm:xmlbuilder@4.2.1": {
      "map": {
        "lodash": "npm:lodash@4.13.1"
      }
    },
    "npm:jspm-nodelibs-http@0.2.0": {
      "map": {
        "http-browserify": "npm:stream-http@2.6.1"
      }
    },
    "npm:stream-http@2.6.1": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "builtin-status-codes": "npm:builtin-status-codes@3.0.0",
        "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
        "xtend": "npm:xtend@4.0.1",
        "readable-stream": "npm:readable-stream@2.2.2"
      }
    },
    "github:bizboard/famous-flex@experiment-patch-cfg": {
      "map": {
        "es6-map": "npm:es6-map@0.1.4"
      }
    },
    "npm:jspm-nodelibs-buffer@0.2.1": {
      "map": {
        "buffer": "npm:buffer@4.9.1"
      }
    },
    "npm:jspm-nodelibs-url@0.2.0": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "npm:jspm-nodelibs-os@0.2.0": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    },
    "npm:readable-stream@2.2.2": {
      "map": {
        "core-util-is": "npm:core-util-is@1.0.2",
        "isarray": "npm:isarray@1.0.0",
        "inherits": "npm:inherits@2.0.3",
        "string_decoder": "npm:string_decoder@0.10.31",
        "process-nextick-args": "npm:process-nextick-args@1.0.7",
        "util-deprecate": "npm:util-deprecate@1.0.2",
        "buffer-shims": "npm:buffer-shims@1.0.0"
      }
    },
    "npm:es6-map@0.1.4": {
      "map": {
        "es6-iterator": "npm:es6-iterator@2.0.0",
        "es6-set": "npm:es6-set@0.1.4",
        "event-emitter": "npm:event-emitter@0.3.4",
        "es5-ext": "npm:es5-ext@0.10.12",
        "es6-symbol": "npm:es6-symbol@3.1.0",
        "d": "npm:d@0.1.1"
      }
    },
    "npm:buffer@4.9.1": {
      "map": {
        "ieee754": "npm:ieee754@1.1.8",
        "isarray": "npm:isarray@1.0.0",
        "base64-js": "npm:base64-js@1.2.0"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "punycode": "npm:punycode@1.3.2",
        "querystring": "npm:querystring@0.2.0"
      }
    },
    "npm:color@0.11.4": {
      "map": {
        "color-string": "npm:color-string@0.3.0",
        "clone": "npm:clone@1.0.2",
        "color-convert": "npm:color-convert@1.8.2"
      }
    },
    "npm:event-emitter@0.3.4": {
      "map": {
        "es5-ext": "npm:es5-ext@0.10.12",
        "d": "npm:d@0.1.1"
      }
    },
    "npm:es6-set@0.1.4": {
      "map": {
        "d": "npm:d@0.1.1",
        "es5-ext": "npm:es5-ext@0.10.12",
        "es6-iterator": "npm:es6-iterator@2.0.0",
        "es6-symbol": "npm:es6-symbol@3.1.0",
        "event-emitter": "npm:event-emitter@0.3.4"
      }
    },
    "npm:es6-symbol@3.1.0": {
      "map": {
        "d": "npm:d@0.1.1",
        "es5-ext": "npm:es5-ext@0.10.12"
      }
    },
    "npm:es6-iterator@2.0.0": {
      "map": {
        "d": "npm:d@0.1.1",
        "es5-ext": "npm:es5-ext@0.10.12",
        "es6-symbol": "npm:es6-symbol@3.1.0"
      }
    },
    "npm:es5-ext@0.10.12": {
      "map": {
        "es6-iterator": "npm:es6-iterator@2.0.0",
        "es6-symbol": "npm:es6-symbol@3.1.0"
      }
    },
    "npm:d@0.1.1": {
      "map": {
        "es5-ext": "npm:es5-ext@0.10.12"
      }
    },
    "npm:jspm-nodelibs-timers@0.2.0": {
      "map": {
        "timers-browserify": "npm:timers-browserify@1.4.2"
      }
    },
    "npm:color-string@0.3.0": {
      "map": {
        "color-name": "npm:color-name@1.1.1"
      }
    },
    "npm:color-convert@1.8.2": {
      "map": {
        "color-name": "npm:color-name@1.1.1"
      }
    },
    "npm:jspm-nodelibs-crypto@0.2.0": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "npm:jspm-nodelibs-string_decoder@0.2.0": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "create-hmac": "npm:create-hmac@1.1.4",
        "randombytes": "npm:randombytes@2.0.3",
        "diffie-hellman": "npm:diffie-hellman@5.0.2",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "public-encrypt": "npm:public-encrypt@4.0.0",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "inherits": "npm:inherits@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.3.2",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "browserify-rsa": "npm:browserify-rsa@4.0.1"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "miller-rabin": "npm:miller-rabin@4.0.0"
      }
    },
    "npm:pbkdf2@3.0.9": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "cipher-base": "npm:cipher-base@1.0.3",
        "sha.js": "npm:sha.js@2.4.8",
        "ripemd160": "npm:ripemd160@1.0.1"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "browserify-rsa": "npm:browserify-rsa@4.0.1"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.3.2"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "browserify-des": "npm:browserify-des@1.0.0",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "browserify-aes": "npm:browserify-aes@1.0.6"
      }
    },
    "npm:jspm-nodelibs-stream@0.2.0": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "npm:elliptic@6.3.2": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "inherits": "npm:inherits@2.0.3",
        "brorand": "npm:brorand@1.0.6",
        "hash.js": "npm:hash.js@1.0.3"
      }
    },
    "npm:parse-asn1@5.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "asn1.js": "npm:asn1.js@4.9.1"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.3",
        "inherits": "npm:inherits@2.0.3",
        "des.js": "npm:des.js@1.0.0"
      }
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.3",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "inherits": "npm:inherits@2.0.3",
        "buffer-xor": "npm:buffer-xor@1.0.3"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.6"
      }
    },
    "npm:cipher-base@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:sha.js@2.4.8": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "readable-stream": "npm:readable-stream@2.2.2"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:asn1.js@4.9.1": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:babel-runtime@6.20.0": {
      "map": {
        "core-js": "npm:core-js@2.4.1",
        "regenerator-runtime": "npm:regenerator-runtime@0.10.1"
      }
    },
    "npm:babel-polyfill@6.20.0": {
      "map": {
        "core-js": "npm:core-js@2.4.1",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "regenerator-runtime": "npm:regenerator-runtime@0.10.1"
      }
    },
    "npm:firebase@3.6.5": {
      "map": {
        "dom-storage": "npm:dom-storage@2.0.2",
        "xmlhttprequest": "npm:xmlhttprequest@1.8.0",
        "faye-websocket": "npm:faye-websocket@0.9.3",
        "rsvp": "npm:rsvp@3.2.1",
        "jsonwebtoken": "npm:jsonwebtoken@7.1.9"
      }
    },
    "npm:faye-websocket@0.9.3": {
      "map": {
        "websocket-driver": "npm:websocket-driver@0.6.5"
      }
    },
    "npm:jsonwebtoken@7.1.9": {
      "map": {
        "xtend": "npm:xtend@4.0.1",
        "lodash.once": "npm:lodash.once@4.1.1",
        "ms": "npm:ms@0.7.2",
        "jws": "npm:jws@3.1.4",
        "joi": "npm:joi@6.10.1"
      }
    },
    "npm:websocket-driver@0.6.5": {
      "map": {
        "websocket-extensions": "npm:websocket-extensions@0.1.1"
      }
    },
    "npm:jws@3.1.4": {
      "map": {
        "jwa": "npm:jwa@1.1.5",
        "safe-buffer": "npm:safe-buffer@5.0.1",
        "base64url": "npm:base64url@2.0.0"
      }
    },
    "npm:joi@6.10.1": {
      "map": {
        "isemail": "npm:isemail@1.2.0",
        "topo": "npm:topo@1.1.0",
        "hoek": "npm:hoek@2.16.3",
        "moment": "npm:moment@2.17.1"
      }
    },
    "npm:jwa@1.1.5": {
      "map": {
        "base64url": "npm:base64url@2.0.0",
        "safe-buffer": "npm:safe-buffer@5.0.1",
        "ecdsa-sig-formatter": "npm:ecdsa-sig-formatter@1.0.9",
        "buffer-equal-constant-time": "npm:buffer-equal-constant-time@1.0.1"
      }
    },
    "npm:topo@1.1.0": {
      "map": {
        "hoek": "npm:hoek@2.16.3"
      }
    },
    "npm:ecdsa-sig-formatter@1.0.9": {
      "map": {
        "base64url": "npm:base64url@2.0.0",
        "safe-buffer": "npm:safe-buffer@5.0.1"
      }
    },
    "npm:lodash-decorators@3.0.2": {
      "map": {
        "lodash": "npm:lodash@4.15.0"
      }
    }
  }
});
