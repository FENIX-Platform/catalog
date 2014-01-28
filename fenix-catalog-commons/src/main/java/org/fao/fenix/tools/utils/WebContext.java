package org.fao.fenix.tools.utils;

import javax.servlet.ServletContext;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public interface WebContext {

    public Properties getInitParameters();
    public String getInitParameter(String key);

    public InputStream getWebrootFileStream (String path) throws IOException;

}
