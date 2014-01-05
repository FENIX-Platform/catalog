package org.fao.fenix.tools.Orient;

import java.lang.annotation.*;

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface OrientClass {
    String value() default "";
}
