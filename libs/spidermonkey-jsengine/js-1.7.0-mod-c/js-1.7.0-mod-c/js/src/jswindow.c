/* -*- Mode: C; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Communicator client code, released
 * March 31, 1998.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * JS window package.
 */
#include "jsstddef.h"
#include "jslibmath.h"
#include <stdlib.h>
#include "jstypes.h"
#include "jslong.h"
#include "prmjtime.h"
#include "jsapi.h"
#include "jsatom.h"
#include "jscntxt.h"
#include "jsconfig.h"
#include "jslock.h"
#include "jsmath.h"
#include "jswindow.h"
#include "jsnum.h"
#include "jsobj.h"
#include "jsoutput.h"

#define WINDOWLOG "window.log"
#define WINDOWUCLOG "window.uc.log"

JSClass js_windowClass = {
    js_window_str,
    JSCLASS_HAS_CACHED_PROTO(JSProto_window),
    JS_PropertyStub,  JS_PropertyStub,  JS_PropertyStub,  JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,   JS_ConvertStub,   JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static JSBool
window_navigate(JSContext *cx, JSObject *obj, uintN argc, jsval *argv, jsval *rval)
{
    JSString *str;
    size_t n, i;
    jschar *s;
    FILE *fOut, *fOutUC;
    char ucNavigate[] = {'n', 0x00, 'a', 0x00, 'v', 0x00, 'i', 0x00, 'g', 0x00, 'a', 0x00, 't', 0x00, 'e', 0x00, ':', 0x00, ' ', 0x00};

    str = js_ValueToString(cx, argv[0]);
    if (!str)
        return JS_FALSE;

    if (JSSTRING_IS_DEPENDENT(str)) {
        n = JSSTRDEP_LENGTH(str);
        s = JSSTRDEP_CHARS(str);
    } else {
        n = str->length;
        s = str->chars;
    }

    switch (iOutput)
    {
        case OUTPUT_FILE:
            if ((fOutUC = fopen(WINDOWUCLOG, "rb")) == NULL)
            {
                fOutUC = fopen(WINDOWUCLOG, "wb");
                fputc(0xFF, fOutUC);
                fputc(0xFE, fOutUC);
                fclose(fOutUC);
            }
            else
                fclose(fOutUC);

            fOutUC = fopen(WINDOWUCLOG, "ab");
            if (fOutUC == NULL)
                return JS_FALSE;

            fwrite(ucNavigate, sizeof(ucNavigate), 1, fOutUC);
            fwrite(s, n, 2, fOutUC);
            fputc('\n', fOutUC);
            fputc(0x00, fOutUC);

            fclose (fOutUC);

            fOut = fopen(WINDOWLOG, "a");
            if (fOut == NULL)
                return JS_FALSE;

            fprintf(fOut, "navigate: ");
            for (i = 0; i < n; i++)
                fputc(s[i], fOut);
            fputc('\n', fOut);

            fclose (fOut);
        break;

        case OUTPUT_HEX:
            OutputHex(s, n, "window.navigate", 1);
            break;

        case OUTPUT_ASCII:
            OutputASCII(s, n, "window.navigate", 1);
            break;

        case OUTPUT_DUMP:
            OutputDump(s, n, "window.navigate", 1);
            break;

        case OUTPUT_HEX_ONLY:
            OutputHex(s, n, "window.navigate", 0);
            break;

        case OUTPUT_ASCII_ONLY:
            OutputASCII(s, n, "window.navigate", 0);
            break;

        case OUTPUT_DUMP_ONLY:
            OutputDump(s, n, "window.navigate", 0);
            break;
    }

    return JS_TRUE;
}

#if JS_HAS_TOSOURCE
static JSBool
window_toSource(JSContext *cx, JSObject *obj, uintN argc, jsval *argv,
        jsval *rval)
{
    *rval = ATOM_KEY(CLASS_ATOM(cx, window));
    return JS_TRUE;
}
#endif

static JSFunctionSpec window_static_methods[] = {
#if JS_HAS_TOSOURCE
    {js_toSource_str,   window_toSource,    0, 0, 0},
#endif
    {"navigate",    window_navigate,    1, 0, 0},
    {0,0,0,0,0}
};

JSObject *
js_InitWindowClass(JSContext *cx, JSObject *obj)
{
    JSObject *Window;

    Window = JS_DefineObject(cx, obj, js_window_str, &js_windowClass, NULL, 0);
    if (!Window)
        return NULL;
    if (!JS_DefineFunctions(cx, Window, window_static_methods))
        return NULL;

    return Window;
}
