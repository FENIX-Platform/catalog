package org.fao.fenix.tools.utils;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;

import java.io.Reader;
import java.io.Writer;
import java.util.Iterator;
import java.util.Map;


public class JSONUtils {
    private static JsonFactory jsonFactory = new JsonFactory();
	private static ObjectMapper mapper = new ObjectMapper();
	
	public static String toJSON(Object obj) throws Exception { return mapper.writeValueAsString(obj); }

    public static void toJSON(Iterator<?> objs, Writer writer) throws Exception {
        JsonGenerator generator = jsonFactory.createJsonGenerator(writer);
        while (objs.hasNext())
            mapper.writeValue(generator, objs.next());
        generator.close();
    }
    public static JsonGenerator createGenerator(Writer writer) throws Exception {
        return jsonFactory.createJsonGenerator(writer);
    }
    public static void toJSON(Iterator<?> objs, JsonGenerator generator) throws Exception {
        while (objs.hasNext())
            mapper.writeValue(generator, objs.next());
    }
    public static void toJSON(Object obj, JsonGenerator generator) throws Exception {
        mapper.writeValue(generator, obj);
    }

	public static <T> T toObject(String json, Class<T> objClass) throws Exception { return mapper.readValue(json, objClass); }

	public static JsonParser createParser(Reader reader) throws Exception { return jsonFactory.createJsonParser(reader); }
    public static <T> Iterator<T> toObject(JsonParser parser, Class<T> objClass) throws Exception { return mapper.readValues(parser, objClass); }
    public static <T> Iterator<T> toObject(Reader reader, Class<T> objClass) throws Exception { return mapper.readValues(jsonFactory.createJsonParser(reader), objClass); }

	public static <T> T convertValue(Object obj, Class<T> objClass) throws Exception { return mapper.convertValue(obj, objClass); }

	public static Map<String,Object> toMap(String json) throws Exception { return mapper.readValue(json, new TypeReference<Map<String, Object>>() {}); }
	
	public static Object cloneByJSON (Object obj) throws Exception { return obj!=null ? toObject(toJSON(obj),obj.getClass()) : null; }

}
