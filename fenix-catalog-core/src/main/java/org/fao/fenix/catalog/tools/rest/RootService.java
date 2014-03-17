package org.fao.fenix.catalog.tools.rest;

import org.fao.fenix.commons.utils.FileUtils;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import java.io.IOException;
import java.nio.file.Files;

@Path("/")
public class RootService {
    @Inject private FileUtils fileUtils;

    @GET
    public String info() {
        try {
            return fileUtils.readTextFile(this.getClass().getResourceAsStream("/index.htm"));
        } catch (IOException e) {
            return null;
        }
    }

}
