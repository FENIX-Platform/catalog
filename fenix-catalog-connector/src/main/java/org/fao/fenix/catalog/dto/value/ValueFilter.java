package org.fao.fenix.catalog.dto.value;


import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.ObjectReader;
import org.codehaus.jackson.map.SerializationConfig;

import java.util.Date;
import java.util.Map;

public abstract class ValueFilter {

    private static final ObjectReader dateObjectMapper = new ObjectMapper().reader(Date.class);

    private ValueFilterType type;
    public ValueFilterType getType() { return type; }



    public ValueFilter getInstance(Object source) {
        if (source instanceof String)
            return new TextFilter((String)source);
        if (source instanceof Map) {
            Object from = ((Map)source).get("from");
            if (from!=null && !(from instanceof Number))
                try {
                    from = dateObjectMapper.readValue((String)from);
                } catch (Exception ex) {
                    from = null;
                }

            Object to = ((Map)source).get("to");
            if (to!=null && !(to instanceof Number))
                try {
                    to = dateObjectMapper.readValue((String)to);
                } catch (Exception ex) {
                    to = null;
                }

            if (from!=null || to!=null)
                if ((from==null || from instanceof Date) && (to==null || to instanceof Date))
                    return new DateValueFilter((Date)from, (Date)to);
                else if ((from==null || from instanceof Number) && (to==null || to instanceof Number))
                    return new NumberValueFilter((Number)from, (Number)to);

        }
        return null;
    }

}
