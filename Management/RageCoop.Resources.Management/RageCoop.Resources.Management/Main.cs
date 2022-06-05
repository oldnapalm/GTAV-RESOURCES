﻿using RageCoop.Server.Scripting;
namespace RageCoop.Resources.Management
{
    public class Main :ServerScript
    {
        public Main()
        {
            API.RegisterCommand("kick", (ctx) =>
            {
                if (ctx.Args.Length<1) { return; }
                var reason = "EAT POOP!";
                if (ctx.Args.Length>=2) { reason=ctx.Args[1]; }
                API.GetClientByUsername(ctx.Args[0]).Kick(reason);
            });
        }
    }
}