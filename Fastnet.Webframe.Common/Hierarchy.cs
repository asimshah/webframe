using System.Collections.Generic;

namespace Fastnet.Webframe.Common2
{
    public abstract class Hierarchy<T> where T : Hierarchy<T>
    {
        public abstract T GetParent();
        public abstract IEnumerable<T> GetChildren();
        public IEnumerable<T> SelfAndParents
        {
            get
            {
                for (var p = this; p != null; p = p.GetParent())
                {
                    yield return (T)p;
                }
            }
        }
        public IEnumerable<T> Parents
        {
            get
            {
                T start = GetParent();
                if (start == null)
                {
                    yield break;
                }
                for (var p = GetParent(); p != null; p = p.GetParent())
                {
                    yield return (T)p;
                }

            }
        }
        public IEnumerable<T> Descendants
        {
            get
            {
                foreach (T child in this.GetChildren())
                {
                    yield return child;
                    foreach (T nc in child.Descendants)
                    {
                        yield return nc;
                    }
                }
            }
        }
        public IEnumerable<T> SelfAndDescendants
        {
            get
            {
                yield return this as T;
                foreach (T child in this.Descendants)
                {
                    yield return child;
                }
            }
        }
    }
}
