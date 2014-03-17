package org.fao.fenix.catalog.tools.orient;

import java.lang.annotation.*;

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface OrientClass {
    String value() default "";
}
