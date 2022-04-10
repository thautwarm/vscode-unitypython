using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;

[Serializable]
public class FileWatcher
{
    // float lastTime;
    public bool isDirty = false;
    public Dictionary<string, DateTime> oldStats;
    readonly IEnumerator coroutine;
    FileWatcher(string dir, string pat)
    {
        coroutine = WatchDirectory(dir, pat);
        oldStats = new Dictionary<string, DateTime>();
    }

    public bool CheckIfDirty()
    {
        coroutine.MoveNext();
        return isDirty;
    }
    public static FileWatcher On(string directory, string pattern)
    {
        return new FileWatcher(directory, pattern);
    }
    public IEnumerator WatchDirectory(string directory, string pattern)
    {
        while(true)
        {    
            yield return null;
            int i = 0;
            if (isDirty == true)
            {
                continue;
            }
            foreach(var path in System.IO.Directory.EnumerateFiles(directory, pattern, SearchOption.AllDirectories))
            {
                if (i++ % 50 == 49)
                {
                    yield return null; // suspend for a few scan
                    if (isDirty == true) continue;
                }
                var info = new FileInfo(path);
                if(oldStats.TryGetValue(path, out var oldWriteTime))
                {
                    if (info.LastWriteTime != oldWriteTime)
                    {
                        isDirty = true;
                        oldStats[path] = info.LastWriteTime;
                        continue;
                    }
                }
                else
                {
                    isDirty = true;
                    oldStats[path] = info.LastWriteTime;
                }
            }        
        }
        
    }
    
}