
/***************************
 *
 * Extra methods
 *
 **************************/

var cst         = require('../../constants.js');
var Common      = require('../Common.js');
var Modularizer = require('../Modularizer.js');
var UX          = require('./CliUx');
var chalk       = require('chalk');
var async       = require('async');
var path        = require('path');
var fs          = require('fs');

module.exports = function(CLI) {

  /**
   * Get version of the daemonized PM2
   * @method getVersion
   * @callback cb
   */
  CLI.prototype.getVersion = function(cb) {
    var that = this;

    that.Client.executeRemote('getVersion', {}, function(err) {
      return cb ? cb.apply(null, arguments) : that.exitCli(cst.SUCCESS_EXIT);
    });
  };

  /**
   * Description
   * @method sendSignalToProcessName
   * @param {} signal
   * @param {} process_name
   * @return
   */
  CLI.prototype.sendDataToProcessId = function(proc_id, packet, cb) {
    var that = this;

    packet.id = proc_id;

    that.Client.executeRemote('sendDataToProcessId', packet, function(err, res) {
      if (err) {
        Common.printError(err);
        return cb ? cb(Common.retErr(err)) : that.exitCli(cst.ERROR_EXIT);
      }
      Common.printOut('successfully sent data to process');
      return cb ? cb(null, res) : that.speedList();
    });
  };

  /**
   * Description
   * @method sendSignalToProcessName
   * @param {} signal
   * @param {} process_name
   * @return
   */
  CLI.prototype.sendSignalToProcessName = function(signal, process_name, cb) {
    var that = this;

    that.Client.executeRemote('sendSignalToProcessName', {
      signal : signal,
      process_name : process_name
    }, function(err, list) {
      if (err) {
        Common.printError(err);
        return cb ? cb(Common.retErr(err)) : that.exitCli(cst.ERROR_EXIT);
      }
      Common.printOut('successfully sent signal %s to process name %s', signal, process_name);
      return cb ? cb(null, list) : that.speedList();
    });
  };

  /**
   * Description
   * @method sendSignalToProcessId
   * @param {} signal
   * @param {} process_id
   * @return
   */
  CLI.prototype.sendSignalToProcessId = function(signal, process_id, cb) {
    var that = this;

    that.Client.executeRemote('sendSignalToProcessId', {
      signal : signal,
      process_id : process_id
    }, function(err, list) {
      if (err) {
        Common.printError(err);
        return cb ? cb(Common.retErr(err)) : that.exitCli(cst.ERROR_EXIT);
      }
      Common.printOut('successfully sent signal %s to process id %s', signal, process_id);
      return cb ? cb(null, list) : that.speedList();
    });
  };

  /**
   * Launch API interface
   * @method web
   * @return
   */
  CLI.prototype.web = function(cb) {
    var that = this;

    var filepath = path.resolve(path.dirname(module.filename), '../HttpInterface.js');

    that.start(filepath, {
      name : 'pm2-http-interface',
      execMode : 'fork_mode'
    }, function(err, proc) {
      if (err) {
        Common.printError(cst.PREFIX_MSG_ERR + 'Error while launching application', err.stack || err);
        return cb ? cb(Common.retErr(err)) : that.speedList();
      }
      Common.printOut(cst.PREFIX_MSG + 'Process launched');
      return cb ? cb(null, proc) : that.speedList();
    });
  };


  /**
   * Ping daemon - if PM2 daemon not launched, it will launch it
   * @method ping
   */
  CLI.prototype.ping = function(cb) {
    var that = this;

    that.Client.executeRemote('ping', {}, function(err, res) {
      if (err) {
        Common.printError(err);
        return cb ? cb(new Error(err)) : that.exitCli(cst.ERROR_EXIT);
      }
      Common.printOut(res);
      return cb ? cb(null, res) : that.exitCli(cst.SUCCESS_EXIT);
    });
  };


  /**
   * Execute remote command
   */
  CLI.prototype.remote = function(command, opts, cb) {
    var that = this;

    CLI[command](opts.name, function(err_cmd, ret) {
      if (err_cmd)
        console.error(err_cmd);
      console.log('Command %s finished', command);
      return cb(err_cmd, ret);
    });
  };

  /**
   * This remote method allows to pass multiple arguments
   * to PM2
   * It is used for the new scoped PM2 action system
   */
  CLI.prototype.remoteV2 = function(command, opts, cb) {
    var that = this;

    if (CLI[command].length == 1)
      return CLI[command](cb);

    opts.args.push(cb);
    return CLI[command].apply(this, opts.args);
  };


  /**
   * Description
   * @method generateSample
   * @param {} name
   * @return
   */
  CLI.prototype.generateSample = function() {
    var that = this;

    var templatePath = path.join(cst.TEMPLATE_FOLDER, cst.APP_CONF_TPL);

    var sample = fs.readFileSync(templatePath);
    var dt     = sample.toString();
    var f_name = 'ecosystem.json';

    try {
      fs.writeFileSync(path.join(process.env.PWD, f_name), dt);
    } catch (e) {
      console.error(e.stack || e);
    }
    Common.printOut('File %s generated', path.join(process.env.PWD, f_name));
    that.exitCli(cst.SUCCESS_EXIT);
  };
};