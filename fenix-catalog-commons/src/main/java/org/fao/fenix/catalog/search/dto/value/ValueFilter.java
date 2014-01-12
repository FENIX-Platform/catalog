package org.fao.fenix.catalog.search.dto.value;


import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.ObjectReader;

import java.util.Date;
import java.util.Map;

public abstract class ValueFilter {

    private static final ObjectReader dateObjectMapper = new ObjectMapper().reader(Date.class);

    private ValueFilterType type;
    public ValueFilterType getType() { return type; }



    public static ValueFilter getInstance(Object source) {
        ValueFilter filter = null;
        if (source instanceof String) {
            filter = new TextFilter((String)source);
            filter.type = ValueFilterType.text;
        } if (source instanceof Map) {
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
                if ((from==null || from instanceof Date) && (to==null || to instanceof Date)) {
                    filter = new DateValueFilter((Date)from, (Date)to);
                    filter.type = ValueFilterType.date;
                } else if ((from==null || from instanceof Number) && (to==null || to instanceof Number)) {
                    filter = new NumberValueFilter((Number)from, (Number)to);
                    filter.type = ValueFilterType.number;
                }
        }
        return filter;
    }

}
