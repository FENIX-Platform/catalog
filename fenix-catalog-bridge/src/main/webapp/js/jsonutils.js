function getJSonsAndTransform(options , callback){

  var o               = {},
      defaultOptions  = { data : {
                            url     : "",
                            method  : "GET",
                          },
                          template : {
                            url     : "",
                            method  : "GET",
                          } }, data, template;

  //Merge default options and parameters
  extend(o, defaultOptions);
  extend(o, options);

  if (o.data.localdata) manageData(o.data.localdata, data)
  else loadJson(o.data.url, o.data.method, o.data.body, function( resp ){ manageData(resp.responseText) })

  if (o.template.localdata) manageTemplate(o.template.localdata, template)
  else loadJson(o.template.url, o.template.method, o.template.body, function( resp ){ manageTemplate(resp.responseText) })

  function manageData(result){
      data = result; 
      if(jsonsReady() && callback) callback(transform(data, template));
  }

  function manageTemplate(result){
      template = result; 
      if(jsonsReady() && callback) callback(transform(data, template));
  }

  function jsonsReady(){

    if (!template || !data) return false;
    else return true;
  
  }

  function loadJson(url, method, body, callback) {  
    
    var xhr;  
      
    if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();  
    else {  
      var versions = ["MSXML2.XmlHttp.5.0",   
                      "MSXML2.XmlHttp.4.0",  
                      "MSXML2.XmlHttp.3.0",   
                      "MSXML2.XmlHttp.2.0",  
                      "Microsoft.XmlHttp"];

      for(var i = 0, len = versions.length; i < len; i++) {  
        try {  xhr = new ActiveXObject(versions[i]); break;  }  
        catch(e){ }  
      } // end for  
    }  
        
    xhr.onreadystatechange = ensureReadiness;  
      
    function ensureReadiness() {  
        if(xhr.readyState < 4) {
            return;  
        }  
          
        if(xhr.status !== 200) {
            return;  
        }  

        // all is well    
        if(xhr.readyState === 4) {  
            callback( xhr );  
        }             
    }  

    xhr.open(method, url, true);  
    xhr.send(body);  
  
  }

  function extend(a, b){
      for(var key in b)
          if(b.hasOwnProperty(key))
              a[key] = b[key];
      return a;
  }

};

function transform(data, template, log){

  function getVal(d, text){

    var split = text.split("."),
        result = d;

    for (var i = 0; i < split.length; i++) { result = result[split[i]]; }
    
    return result;

  };

  if (data === undefined || template === undefined) alert('Impossible to transform Json. Data or Template missing');
  else {
    //Checks data and template are JSon
    try { JSON.parse(data); } 
    catch (e) {  alert('Data is not a valid JSon file'); return; }

    try { JSON.parse(template); } 
    catch (e) { alert('Template is not a valid JSon file'); return; }
  };
 
  var output  = {},
      errors  = {},
      d       = eval("(" + data + ")"),
      t       = eval("(" + template + ")"),
      tmplKeyset = Object.keys(t);

  for (var i = 0; i < tmplKeyset.length; i++) {

    if (typeof t[tmplKeyset[i]] === 'object'){ output[tmplKeyset[i]] = eval("(" + transform(data, JSON.stringify(t[tmplKeyset[i]])) + ")"); 
    } else {
      var v = getVal(d, t[tmplKeyset[i]]);
      if (v === undefined){  errors[tmplKeyset[i]] = t[tmplKeyset[i]]; } 
      else { output[tmplKeyset[i]] = getVal(d, t[tmplKeyset[i]]); }
    }
  };

  if(log === true){
    if (Object.keys( errors ).length > 0) {
      alert('Errors during transformations. Checks Console');
      for (var i = 0;  i < Object.keys(errors).length; i++) console.log('No matching found for '+ Object.keys(errors)[i] +' : '+ errors[Object.keys(errors)[i]]);
    }; 
  }

  return JSON.stringify(output);

};