"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleWrapper = ExampleWrapper;
exports.Example = Example;
var utils_1 = require("@/lib/utils");
function ExampleWrapper(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className="bg-background w-full">
      <div data-slot="example-wrapper" className={(0, utils_1.cn)("mx-auto grid min-h-screen w-full max-w-5xl min-w-0 content-center items-start gap-8 p-4 pt-2 sm:gap-12 sm:p-6 md:grid-cols-2 md:gap-8 lg:p-12 2xl:max-w-6xl", className)} {...props}/>
    </div>);
}
function Example(_a) {
    var title = _a.title, children = _a.children, className = _a.className, containerClassName = _a.containerClassName, props = __rest(_a, ["title", "children", "className", "containerClassName"]);
    return (<div data-slot="example" className={(0, utils_1.cn)("mx-auto flex w-full max-w-lg min-w-0 flex-col gap-1 self-stretch lg:max-w-none", containerClassName)} {...props}>
      <div className="text-muted-foreground px-1.5 py-2 text-xs font-medium">
        {title}
      </div>
      <div data-slot="example-content" className={(0, utils_1.cn)("bg-background text-foreground flex min-w-0 flex-1 flex-col items-start gap-6 border border-dashed p-4 sm:p-6 *:[div:not([class*='w-'])]:w-full", className)}>
        {children}
      </div>
    </div>);
}
