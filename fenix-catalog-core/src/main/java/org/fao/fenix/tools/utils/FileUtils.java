package org.fao.fenix.tools.utils;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.file.CopyOption;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.nio.file.Files;

public class FileUtils {
    public static final Charset UTF8 = Charset.forName("UTF-8");


    public static void copy (File source, File destination) throws IOException {
        Files.copy(source.toPath(), destination.toPath(), StandardCopyOption.REPLACE_EXISTING);
        if (source.isDirectory())
            for (File sourceFile : source.listFiles())
                copy(sourceFile,new File (destination,sourceFile.getName()));
    }

    public static void delete(File toDelete) {
        if (toDelete.exists()) {
            if (toDelete.isDirectory())
                for (File f:toDelete.listFiles())
                    delete(f);
            toDelete.delete();
        }
    }

    public static String readTextFile(String file) throws IOException { return readTextFile(new FileInputStream(file), UTF8); }
    public static String readTextFile(File file) throws IOException { return readTextFile(new FileInputStream(file), UTF8); }
    public static String readTextFile(String file, Charset charset) throws IOException { return readTextFile(new FileInputStream(file), charset); }
    public static String readTextFile(File file, Charset charset) throws IOException {return readTextFile(new FileInputStream(file),charset); }
    public static String readTextFile(InputStream in) throws IOException { return readTextFile(in, UTF8); }
    public static String readTextFile(InputStream in, Charset charset) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in,charset));
        StringBuilder buffer = new StringBuilder();
        for (String line = reader.readLine(); line!=null; line = reader.readLine())
            buffer.append('\n').append(line);
        return buffer.length()>0 ? buffer.substring(1) : null;
    }

    public static void writeTextFile(File file, String text) throws IOException {
        BufferedWriter out = new BufferedWriter(new FileWriter(file,false), 1024);
        out.write(text);
        out.flush();
        out.close();
    }


}
