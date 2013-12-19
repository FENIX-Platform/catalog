package org.fao.fenix.tools.rest;

import org.fao.fenix.tools.utils.FileUtils;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import java.io.IOException;
import java.nio.file.Files;

@Path("/")
public class RootService {

    @GET
    public String info() {
        try {
            return FileUtils.readTextFile(this.getClass().getResourceAsStream("/index.htm"));
        } catch (IOException e) {
            return null;
        }
    }

}
